# WIM — World Is Mine

Application mobile d'échange de logements entre particuliers. On publie son
logement, on parcourt ceux des autres, on convient d'un échange par messagerie,
puis on se note mutuellement après le séjour.

Le dépôt est un monorepo Turborepo : une API NestJS, une application mobile
Expo, un site Next.js, et des paquets partagés entre eux.

---

## Ce que fait l'application

| | |
|---|---|
| **Comptes** | Inscription par mot de passe, Google ou Apple. Vérification d'identité obligatoire par Stripe Identity avant d'accéder au service. |
| **Logements** | Annonce avec photos, équipements, véhicule, périodes de disponibilité. L'adresse exacte n'est jamais publique : la carte affiche une zone de 5 km. |
| **Recherche** | Par ville et dates, ou en balayant un deck de recommandations classé selon des pondérations réglables depuis l'administration. |
| **Échanges** | Demande, choix des logements de part et d'autre, acceptation, rappels avant et après le séjour, avis croisés. |
| **Messagerie** | Texte, photos et messages vocaux, traduction automatique par DeepL, accusés de lecture, notifications. |
| **Modération** | Signalement de comptes et d'avis, blocage, suspension, avec alerte par courriel à l'administration. |
| **Administration** | Signalements, comptes, statistiques d'usage et courbes hebdomadaires, réglage du classement des recommandations. |

---

## Structure

```
apps/
  api/       NestJS, Prisma, PostgreSQL — architecture hexagonale
  mobile/    Expo / React Native — l'application livrée
  web/       Next.js — site, non déployé à ce jour
  docs/      Next.js — documentation, non déployée
packages/
  shared/    Types et utilitaires communs à l'API et au mobile
  i18n/      Traductions françaises et anglaises
  ui/        Composants web partagés
  eslint-config/ typescript-config/
deploy/      Docker Compose de production, nginx, sauvegardes, pages légales
```

L'API suit une architecture hexagonale : `domain` (entités et interfaces de
dépôt), `application` (cas d'usage), `infrastructure` (Prisma, Stripe, SMTP,
Sentry), `interfaces/http` (contrôleurs et modules). Les fournisseurs sont
choisis à l'exécution selon les variables d'environnement présentes — sans clé
Stripe, la vérification d'identité bascule sur un fournisseur simulé.

---

## Démarrer en local

### Prérequis

- Node 20 ou plus, npm 10
- Docker et Docker Compose
- Un compte Expo et `eas-cli` pour construire l'application mobile

### 1. Installer

```bash
git clone https://github.com/laurabjn/WIM.git
cd WIM
npm install
```

### 2. Configurer

Deux fichiers à créer, tous deux ignorés par Git.

`apps/api/.env` :

```
DATABASE_URL=postgresql://wim:wim@localhost:5432/wim?schema=public
JWT_ACCESS_SECRET=une-valeur-aleatoire
JWT_REFRESH_SECRET=une-autre-valeur
JWT_RESET_SECRET=une-troisieme-valeur
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
JWT_RESET_TTL=3600
FRONTEND_URL=http://localhost:3001
WS_CORS_ORIGIN=*
WS_NAMESPACE=/ws
```

Facultatif, selon ce que l'on veut essayer : `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` pour les courriels, `ADMIN_EMAIL` pour
les alertes de modération, `DEEPL_API_KEY` pour la traduction,
`UNSPLASH_ACCESS_KEY` pour les photos de ville, `STRIPE_SECRET_KEY` et
`STRIPE_WEBHOOK_SECRET` pour la vérification d'identité réelle,
`GOOGLE_CLIENT_IDS` et `APPLE_CLIENT_IDS` pour la connexion par fournisseur.
Chacune absente, la fonction correspondante se désactive proprement plutôt que
d'échouer.

`apps/mobile/.env` :

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
EXPO_PUBLIC_MAPBOX_TOKEN=votre-jeton-mapbox
```

`10.0.2.2` est l'adresse de la machine hôte vue depuis l'émulateur Android. Sur
un téléphone réel, mettre l'adresse IP du poste sur le réseau local.

### 3. Lancer la base et l'API

```bash
docker compose up -d
```

Quatre services démarrent : PostgreSQL, l'API sur le port 3000, le site sur le
3001, et un conteneur éphémère qui applique les migrations avant de s'arrêter.
L'API répond alors sur `http://localhost:3000/api/health`.

### 4. Remplir la base

```bash
cd apps/api
node prisma/seed-demo.js
```

Treize comptes de démonstration, seize logements, des conversations, des
échanges à différents stades et des avis. Les identifiants s'affichent à la fin
du script.

Pour se donner un accès administrateur :

```bash
read -rsp "Mot de passe : " MDP; echo
docker exec -e ADMIN_ACCOUNT_EMAIL=admin@local.test -e ADMIN_ACCOUNT_PASSWORD="$MDP" \
  wim_api node prisma/create-admin.js
unset MDP
```

### 5. Lancer l'application mobile

```bash
npm run dev:mobile
```

L'application utilise des modules natifs — Mapbox, Google Sign-In, Stripe,
notifications — qu'Expo Go ne contient pas. Il faut donc une build de
développement :

```bash
cd apps/mobile
eas build --platform android --profile development
```

---

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev:api` | API en mode surveillance |
| `npm run dev:mobile` | Serveur Metro pour l'application |
| `npm run dev:web` | Site Next.js |
| `npm run lint` | ESLint sur tout le dépôt, zéro avertissement toléré |
| `npm run check-types` | TypeScript sur tous les espaces de travail |
| `npm run test` | Tests unitaires : 57 côté API, 18 côté web, 13 côté mobile |
| `npm run format` | Prettier |

L'intégration continue rejoue installation, génération Prisma, typage, analyse
statique et tests à chaque poussée.

---

## Base de données

Les migrations sont écrites à la main, jamais générées par `migrate dev`, et
appliquées par `prisma migrate deploy` — y compris au démarrage du conteneur de
production. Cinquante-deux migrations à ce jour.

```bash
cd apps/api
npx prisma migrate deploy    # appliquer
npx prisma studio            # inspecter
```

Après toute modification de `schema.prisma`, écrire le fichier SQL
correspondant dans `prisma/migrations/<horodatage>_<nom>/migration.sql`.

---

## Déploiement

L'API tourne sur un VPS OVH derrière nginx, en Docker Compose. Tout est décrit
dans [deploy/README.md](deploy/README.md) : première installation, mise à jour,
sauvegardes quotidiennes, dettes connues avant lancement.

Le point à retenir : `deploy/docker-compose.prod.yml` transmet les variables
d'environnement **explicitement**. Une variable absente de ce fichier
n'atteindra jamais le conteneur, quoi qu'en dise `.env.prod`.

L'application mobile se construit et se distribue par EAS. Une modification qui
ne touche que `apps/api` ou `deploy` ne demande **aucune build** : un
redéploiement suffit.

---

## Conventions

- Les branches suivent `sprint-<numéro>-<sujet>` pour un sprint, `feat/` ou
  `fix/` pour le reste, et sont fusionnées par pull request.
- Le code ne porte pas de commentaires : les explications vont dans le message
  de commit.
- Les messages de commit sont rédigés en français et expliquent le pourquoi,
  pas seulement le quoi.
