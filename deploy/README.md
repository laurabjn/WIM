# Déploiement de l'API WIM sur le VPS OVH

Cible : le VPS OVH `vps-e3557212.vps.ovh.net`, qui fait **déjà tourner nginx**
(Ubuntu). On ne touche pas à ce qui y est déjà servi : l'API et PostgreSQL sont
ajoutés en conteneurs Docker, et le nginx existant se contente de proxifier un
nouveau sous-domaine vers l'API.

```
Internet
   │
   ▼
nginx (sur l'hôte, déjà en place)  :80 / :443  ── TLS certbot
   ├── worldismine.fr       → backend existant (renvoie 502 actuellement)
   └── api.worldismine.fr   → 127.0.0.1:3010          [À AJOUTER]
                                    │
                        ┌───────────▼────────────┐
                        │ Docker                 │
                        │  wim_api  :3000        │  réseaux wim_public
                        │  wim_db   :5432        │  + wim_internal (isolé)
                        └────────────────────────┘
```

La base de données n'est joignable que depuis le réseau Docker interne : aucun
port n'est publié pour elle, ni sur l'hôte ni sur Internet.

Ressources OVH concernées :

| Ressource             | Valeur                                        |
| --------------------- | --------------------------------------------- |
| VPS                   | `vps-e3557212.vps.ovh.net`                    |
| IPv4 / IPv6           | `91.134.134.251` / `2001:41d0:305:2100::e7c3` |
| Domaine               | `worldismine.fr`                              |
| Sous-domaine de l'API | `api.worldismine.fr` (à créer)                |
| Messagerie            | MX Plan + Zimbra, MX chez OVH                 |

---

## 1. Préparer le DNS

`worldismine.fr` pointe **déjà** vers le VPS (`91.134.134.251`). Il ne manque
que le sous-domaine de l'API.

Dans l'espace client OVH → **Noms de domaine** → `worldismine.fr` → **Zone DNS**
→ *Ajouter une entrée* :

| Type | Sous-domaine | Cible                      | TTL |
| ---- | ------------ | -------------------------- | --- |
| A    | `api`        | `91.134.134.251`           | 60  |
| AAAA | `api`        | `2001:41d0:305:2100::e7c3` | 60  |

> ⚠️ Ne touche pas aux entrées **MX** (`mx1/mx2/mx3.mail.ovh.net`) ni aux entrées
> `TXT` de type SPF/DKIM : elles font fonctionner ta messagerie MX Plan/Zimbra.
> Ajouter un sous-domaine `api` est sans effet sur elles.

Vérifie la propagation avant de demander le certificat — certbot échouera tant
que le DNS ne résout pas :

```bash
dig +short api.worldismine.fr    # doit afficher 91.134.134.251
```

## 2. Faire l'état des lieux du VPS

Le VPS n'est pas vierge. Avant toute chose, regarde ce qui y tourne :

```bash
ssh debian@91.134.134.251     # ou ubuntu@ / root@ selon l'image OVH

lsb_release -a                    # version d'Ubuntu
ls -l /etc/nginx/sites-enabled/   # ce que nginx sert déjà
sudo ss -tlnp                     # ports occupés — vérifie que 3010 est libre
docker ps -a 2>/dev/null          # Docker déjà installé, avec quoi dessus
sudo ufw status                   # le pare-feu est-il déjà actif
```

> Le `502 Bad Gateway` actuel sur `https://worldismine.fr` signifie que nginx
> proxifie vers un backend arrêté. Identifie-le avant de continuer : si c'est
> une ancienne version de cette API, il faudra l'arrêter pour éviter que deux
> instances écrivent dans deux bases différentes.

**Docker** (à installer seulement s'il est absent) :

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
# Se déconnecter/reconnecter pour que le groupe docker prenne effet
```

**Pare-feu** — si UFW est déjà actif et que le site fonctionne, ne change rien.
S'il est inactif :

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> ⚠️ Vérifie que SSH est bien autorisé **avant** `ufw enable`, sinon tu perds
> l'accès au VPS (il faudrait passer par la console KVM du manager OVH).
>
> Le port `3010` ne doit **pas** être ouvert : le conteneur n'écoute que sur la
> loopback, nginx est le seul à y accéder.

## 3. Récupérer le code

```bash
sudo mkdir -p /opt/wim && sudo chown "$USER":"$USER" /opt/wim
git clone https://github.com/laurabjn/WIM.git /opt/wim
cd /opt/wim
```

Si le dépôt est privé, utilise une **deploy key** GitHub en lecture seule plutôt
que tes identifiants personnels (Settings → Deploy keys sur le dépôt).

## 4. Configurer les secrets

```bash
cp deploy/.env.prod.example deploy/.env.prod
chmod 600 deploy/.env.prod

# Générer les secrets
openssl rand -hex 24      # POSTGRES_PASSWORD (hex : il va dans une URL)
openssl rand -base64 48   # JWT_ACCESS_SECRET
openssl rand -base64 48   # JWT_REFRESH_SECRET
openssl rand -base64 48   # JWT_RESET_SECRET

nano deploy/.env.prod
```

Ou, pour les injecter directement sans édition manuelle :

```bash
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 24)|" deploy/.env.prod
sed -i "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$(openssl rand -base64 48 | tr -d '\n')|" deploy/.env.prod
sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d '\n')|" deploy/.env.prod
sed -i "s|^JWT_RESET_SECRET=.*|JWT_RESET_SECRET=$(openssl rand -base64 48 | tr -d '\n')|" deploy/.env.prod
```

Il ne restera plus qu'à renseigner `SMTP_PASS` à la main.

Les valeurs propres à `worldismine.fr` sont déjà préremplies. Il reste à
renseigner les trois secrets JWT, `POSTGRES_PASSWORD` et `SMTP_PASS`.

> `POSTGRES_PASSWORD` n'est lu qu'au **premier** démarrage (initialisation du
> cluster). Le modifier ensuite ne change rien à la base existante : il faudrait
> un `ALTER USER` manuel.

## 5. Démarrer la stack Docker

```bash
cd /opt/wim
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d --build
```

Le premier build prend plusieurs minutes (installation des dépendances +
compilation Nest). Au démarrage, l'API applique automatiquement les migrations
Prisma (`prisma migrate deploy`) avant d'écouter.

Suivre les logs :

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod logs -f api
```

Vérifier **en local sur le VPS**, avant même de toucher à nginx :

```bash
# Doit renvoyer {"status":"ok","database":"up","uptime":N}
curl -s http://127.0.0.1:3010/api/health

# La colonne STATUS de wim_api doit afficher "healthy"
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod ps
```

> Si le VPS a moins de 2 Go de RAM, le build peut être tué par l'OOM killer.
> Deux options : ajouter du swap (`sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`),
> ou construire l'image en CI et la pousser sur GHCR (voir §10).

## 6. Exposer l'API via nginx

Tant que cette étape n'est pas faite, l'API n'est joignable que depuis le VPS.

```bash
sudo cp /opt/wim/deploy/nginx/api.worldismine.fr.conf \
        /etc/nginx/sites-available/api.worldismine.fr
sudo ln -s /etc/nginx/sites-available/api.worldismine.fr \
           /etc/nginx/sites-enabled/

# Valide la syntaxe SANS interrompre le site existant
sudo nginx -t
sudo systemctl reload nginx
```

Puis le certificat TLS. `certbot --nginx` modifie lui-même le fichier pour y
ajouter le bloc `443` et la redirection HTTP → HTTPS :

```bash
# Installer certbot s'il est absent
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d api.worldismine.fr
```

Vérifier depuis ton poste :

```bash
curl -s https://api.worldismine.fr/api/health
```

Le renouvellement est automatique (timer systemd `certbot.timer`). Pour le
tester : `sudo certbot renew --dry-run`.

## 7. Redéployer après un changement

```bash
cd /opt/wim
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d --build
```

Les migrations Prisma non appliquées le sont automatiquement au redémarrage du
conteneur `api`. Les volumes (base, uploads) sont préservés. nginx n'a pas
besoin d'être touché.

Comme les commandes sont longues, un alias aide :

```bash
echo "alias wim='docker compose -f /opt/wim/deploy/docker-compose.prod.yml --env-file /opt/wim/deploy/.env.prod'" >> ~/.bashrc
source ~/.bashrc
# puis : wim ps / wim logs -f api / wim up -d --build
```

## 8. Sauvegardes

Le script dumpe la base depuis le conteneur : il lui faut donc l'accès au
socket Docker. Si ton compte n'est pas dans le groupe `docker` — le cas par
défaut — lance-le avec `sudo`, sans quoi il s'arrête sur
`permission denied ... /var/run/docker.sock`.

```bash
chmod +x /opt/wim/deploy/backup-db.sh
sudo mkdir -p /var/backups/wim

# Test manuel
sudo /opt/wim/deploy/backup-db.sh

# Planification quotidienne à 3h, dans la crontab de root pour la même raison
sudo crontab -e
# ajouter :
0 3 * * * /opt/wim/deploy/backup-db.sh >> /var/log/wim-backup.log 2>&1
```

Le script dumpe la base (`pg_dump -Fc`) **et** archive le volume des uploads,
avec 14 jours de rétention.

Une sauvegarde qui échoue en silence ne se découvre qu'au moment de restaurer.
Après la première nuit, vérifie que le fichier existe :

```bash
ls -lh /var/backups/wim/
```

### Copie hors du VPS

Tant que les sauvegardes ne quittent pas la machine, elles ne protègent que
des erreurs logicielles : perdre le VPS, c'est perdre la base **et** ses
sauvegardes. Le script copie vers un stockage distant dès que `RCLONE_REMOTE`
est renseigné.

Côté OVH, dans l'espace client : **Public Cloud** → **Object Storage** →
créer un conteneur (`wim-backups`, région GRA, classe Standard), puis
**Users & Roles** → créer un utilisateur S3 et générer ses identifiants. Le
volume ici se compte en centaines de mégaoctets : la facture reste de l'ordre
de quelques centimes par mois.

Sur le VPS, la configuration doit appartenir à **root**, puisque c'est root
qui exécute la tâche planifiée. Un `rclone config` lancé sans `sudo` écrirait
dans le mauvais dossier et la copie échouerait toutes les nuits.

```bash
sudo apt update && sudo apt install -y rclone
sudo rclone config
```

Réponses attendues : `n` (nouveau remote), nom `ovh`, type `s3`, provider
`Other`, la clé d'accès puis la clé secrète, région `gra`, endpoint
`s3.gra.io.cloud.ovh.net`, le reste par défaut.

```bash
# Le remote répond-il ?
sudo rclone lsd ovh:

# Brancher la copie sur les sauvegardes
grep -q '^RCLONE_REMOTE=' /opt/wim/deploy/.env.prod   && sed -i 's|^RCLONE_REMOTE=.*|RCLONE_REMOTE=ovh:wim-backups|' /opt/wim/deploy/.env.prod   || echo 'RCLONE_REMOTE=ovh:wim-backups' >> /opt/wim/deploy/.env.prod

sudo /opt/wim/deploy/backup-db.sh
```

La sortie doit se terminer par `[backup] Copie distante OK`. À partir de là, un
échec de copie fait échouer toute la tâche : le dump local est déjà écrit, mais
le journal signale que la copie distante n'est pas partie, ce qui est
préférable à une sauvegarde qu'on croit à l'abri.

La rétention distante (`REMOTE_RETENTION_DAYS`, 90 jours) est plus longue que
la locale : le stockage objet coûte peu, et une corruption peut n'être
découverte que des semaines plus tard.

**Restauration** :

```bash
# Base
cat /var/backups/wim/wim-AAAAMMJJ-HHMMSS.dump | \
  docker exec -i -e PGPASSWORD="$POSTGRES_PASSWORD" wim_db \
  pg_restore -U wim -d wim --clean --if-exists

# Uploads
docker run --rm -v wim_wim_uploads:/data -v /var/backups/wim:/backup alpine \
  tar xzf /backup/wim-uploads-AAAAMMJJ-HHMMSS.tar.gz -C /data
```

> Les sauvegardes restent sur le VPS : si le disque meurt, elles meurent avec.
> Copie-les ailleurs — `rclone` vers OVH Object Storage, ou un `scp` planifié
> depuis une autre machine. Active aussi les **snapshots automatiques** du VPS
> dans le manager OVH (option payante, quelques euros par mois).

## 9. Accéder à la base depuis ton poste

La base n'écoute que sur le réseau Docker interne. Pour la consulter avec
TablePlus / DBeaver / `psql`, publie-la sur la loopback du VPS en ajoutant au
service `db` du compose :

```yaml
ports:
  - '127.0.0.1:5432:5432'
```

Puis, depuis ton poste, ouvre un tunnel SSH et connecte-toi sur `localhost:5433` :

```bash
ssh -L 5433:localhost:5432 debian@91.134.134.251 -N
```

Le préfixe `127.0.0.1:` est essentiel — sans lui, Docker ouvre le port sur
toutes les interfaces et contourne UFW (Docker écrit ses propres règles iptables
en amont de celles d'UFW).

## 10. Aller plus loin

- **Build en CI** : construire l'image dans GitHub Actions, la pousser sur
  `ghcr.io`, et remplacer le bloc `build:` du service `api` par
  `image: ghcr.io/laurabjn/wim-api:<tag>`. Le VPS n'a alors plus qu'à faire
  `docker compose pull && docker compose up -d` — plus rapide et sans risque d'OOM.
- **Uploads** : ils vivent dans un volume Docker sur le disque du VPS. Si le
  volume grossit, bascule vers OVH Object Storage (S3-compatible) via
  `multer-s3`.
- **Monitoring** : `docker stats`, ou Uptime Kuma pointé sur
  `https://api.worldismine.fr/api/health`.

---

## WebSocket

Le gateway socket.io est exposé sur le **namespace** `/ws`, pas sur un chemin
HTTP `/ws` : le endpoint HTTP réel reste `/socket.io/`. Côté client :

```ts
io('https://api.worldismine.fr/ws', { withCredentials: true });
```

La configuration nginx fournie relaie déjà l'upgrade WebSocket (`Upgrade` /
`Connection`) et désactive le buffering. Les origines autorisées sont pilotées
par `WS_CORS_ORIGIN`.

---

## Points à traiter avant une vraie mise en production

1. **Le backend en 502 sur `worldismine.fr`** doit être identifié et, s'il
   s'agit d'une ancienne instance de cette API, arrêté proprement.
2. **Pas de rate limiting** sur les routes d'authentification
   (`@nestjs/throttler` couvrirait le besoin).
3. **`prisma/seed.ts`** n'est pas exécuté en production — c'est volontaire. Si un
   jeu de données initial est nécessaire, le lancer manuellement une fois.
4. **Un `console.log` du payload de création de logement** subsiste dans
   [home.controller.ts:85](../apps/api/src/interfaces/http/controllers/home.controller.ts#L85)
   et écrira des données utilisateur dans les logs du conteneur.
5. **Sauvegardes hors du VPS** : le cron écrit dans `/var/backups/wim`, sur le
   même disque que la base. Les répliquer ailleurs (§8).

## Lien universel Android (retour depuis Stripe Identity)

Après une vérification d'identité, Stripe renvoie la personne sur
`https://worldismine.fr/verification-identite`. Pour qu'Android rende la main à
l'application au lieu d'ouvrir un navigateur, le domaine doit déclarer qu'il
appartient à l'application. C'est le rôle de `site/.well-known/assetlinks.json`.

Ce fichier n'est pas servi par le VPS : `worldismine.fr` tourne sur un
hébergement Apache séparé. Il faut l'y déposer par FTP, à la racine du site :

    www/.well-known/assetlinks.json

Il doit répondre en HTTP 200, sans redirection, à l'adresse
`https://worldismine.fr/.well-known/assetlinks.json`.

Deux pièges :

- Android vérifie ce fichier **à l'installation**. S'il n'est pas en ligne
  avant, le lien restera ordinaire jusqu'à la réinstallation suivante.
- L'empreinte est celle du certificat de build EAS. Le jour d'une publication
  sur le Play Store, Google resigne l'application : il faudra **ajouter** son
  empreinte à la liste, sans retirer celle-ci tant que des APK directs
  circulent.

Vérifier depuis un poste :

    curl -s https://worldismine.fr/.well-known/assetlinks.json

## Pages legales du site

`site/confidentialite.html` et `site/conditions.html` sont des **premiers jets**,
rediges a partir de ce que l'application collecte reellement. Ils ne remplacent pas
une relecture juridique.

Chaque passage surligne en jaune porte la mention `A COMPLETER` : identite de
l'editeur, adresse de contact, durees de conservation, mediateur de la consommation.
Tant qu'il en reste un, les pages ne sont pas publiables.

Elles se deposent sur l'hebergement Apache, au meme endroit que le fichier
d'association Android :

    www/confidentialite.html
    www/conditions.html

Elles doivent repondre en HTTP 200 aux adresses
`https://worldismine.fr/confidentialite.html` et
`https://worldismine.fr/conditions.html`, qui sont exigees par :

- Google, pour publier l'ecran de consentement OAuth et sortir du mode test
- l'App Store et le Play Store, avant toute mise en ligne

A mettre a jour quand les abonnements seront actifs : le paiement, la facturation et
la resiliation ne figurent dans aucune des deux pages.
