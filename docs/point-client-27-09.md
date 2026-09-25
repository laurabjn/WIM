# Point client — samedi 27 septembre 2026

Fiche de préparation. L'ordre est celui du coût : ce qui bloque d'abord, ce qui
décide ensuite, ce qui informe à la fin.

---

## 1. Ce qui bloque, et qu'il faut repartir avec

Sans ces cinq informations, les pages légales restent incomplètes. Sans pages
légales complètes, **aucun des deux stores n'accepte la fiche**. C'est le seul
verrou qui reste entre l'application et sa publication.

| Ce qu'il faut | Pourquoi, s'il demande |
| --- | --- |
| **Le capital social** de la SAS | La loi impose à une société par actions simplifiée de le publier. Il est absent de son propre site. |
| **Le médiateur de la consommation**, avec ses coordonnées | L'adhésion est obligatoire pour tout professionnel qui vend à des particuliers. |
| **Sa position sur l'assurance** des séjours : proposée, ou chacun garde la sienne ? | Les conditions doivent le dire. En cas de sinistre chez un membre, c'est la première question posée. |
| **Les bornes de la garantie d'échange** | Voir point 2, c'est le sujet le plus important de la réunion. |
| **La durée de conservation des signalements** traités | Un an est l'usage. Figure dans la politique et dans le registre. |

Ajouter, si l'occasion se présente : l'adresse de contact publiée est
**nominative**. Une adresse de fonction survivrait au départ de la personne —
c'est elle qui recevra les demandes RGPD pendant des années.

---

## 2. Les trois décisions à lui faire prendre

### La garantie d'échange — le vrai sujet

Il tient à « Échange garanti ou 2ème année offerte ». C'est écrit dans les
conditions d'utilisation, donc **opposable**. Il manque les bornes :

- Qu'est-ce qui compte comme **échange conclu** ?
- Qu'est-ce que le membre doit avoir fait pour y avoir droit — publié un
  logement ? renseigné des disponibilités ? envoyé un nombre minimum de
  demandes ?
- Sous quel **délai** réclame-t-il, et **à quelle adresse** ?

À dire tel quel : *sans ces bornes, quelqu'un qui s'inscrit, ne publie rien et
ne fait aucune demande pourra réclamer sa deuxième année — et il aura raison.*

### L'assistance : sa page contredit son application

Sa page Contact annonce **lundi au vendredi, 9h-18h**, réponse sous deux jours
ouvrés. L'application promet **24h/24 et 7j/7**. Les deux sont publiés sur le
même domaine.

Recommandation : aligner l'application sur la réalité de sa page. Une promesse
de disponibilité permanente qu'on ne tient pas est une pratique commerciale
trompeuse, et elle est ici contredite par son propre site — n'importe quel
membre mécontent le verra en trente secondes.

### Le site décrit une autre application

worldismine.fr présente « une application mobile d'**échange d'objets** entre
particuliers » — vêtements, livres, jeux — et précise « pas de transaction
financière, pas de frais de commission ».

Trois conséquences, à énoncer calmement :

- **Stripe** vérifie le site du marchand pendant la validation du compte. Il y
  lit qu'aucune transaction n'a lieu, alors qu'on lui demande d'encaisser un
  abonnement annuel. C'est peut-être ce qui retient son dossier.
- **Apple et Google** rapprochent l'application, sa fiche et le site de
  l'éditeur.
- Les **pages légales** décrivent un échange de logements avec abonnement :
  publiées sur ce domaine, elles contrediront les pages voisines.

Les textes corrigés sont prêts, page par page, dans `docs/textes-du-site.md`.
Ils gardent sa structure et son graphisme ; seuls les paragraphes changent.
Il peut taire le prix s'il le souhaite, mais **pas l'existence d'un abonnement
payant**.

---

## 3. Ce qu'il doit faire, lui, et qui prend du temps

| Action | Délai | Conséquence si repoussé |
| --- | --- | --- |
| **Compte développeur Apple** au nom de la société, avec son numéro **D-U-N-S** | Plusieurs jours pour le D-U-N-S | Rien ne peut être déposé sur l'App Store, même tout le reste prêt. **C'est le délai le plus long : à lancer lundi au plus tard.** |
| **Activer le compte Stripe** | Dépend de son dossier | Personne ne peut payer à l'ouverture |
| **Captures iPhone et iPad** | Une heure | La fiche App Store ne peut pas être montée. Le brief est prêt. |
| **Image de présentation 1024 × 500** | — | Google refuse la fiche sans elle. Il a dit s'en charger ; la maquette que j'ai faite peut servir de base. |
| Compte Google Play, 25 € | Une journée | — |

---

## 4. Ce que tu peux annoncer comme fait

De quoi asseoir la discussion avant d'aborder ce qui manque.

- Le **paiement fonctionne de bout en bout** : souscription, enregistrement
  d'une carte avant même d'être abonné, changement de moyen de paiement,
  résiliation, tarif étudiant, parrainage.
- La **vérification d'identité** revient dans l'application au lieu de laisser
  la personne dans son navigateur.
- **Conformité RGPD terminée** : suppression de compte, export de ses données
  par courriel, registre des traitements rédigé, politique de confidentialité
  et conditions d'utilisation écrites et **en ligne**.
- **Sauvegardes quotidiennes**, et la restauration a été éprouvée pour de vrai —
  pas seulement documentée.
- Les trois volets d'améliorations qu'il avait demandés sont livrés.
- L'icône iOS accepte sa **variante sombre**, avec les fichiers qu'il a envoyés.

---

## 5. Les deux risques à nommer maintenant

Mieux vaut qu'il les entende de toi avant de les découvrir.

**Apple et l'abonnement hors achat intégré.** Apple exige que tout abonnement
ouvrant une fonction passe par son système de paiement, avec sa commission.
WIM encaisse par Stripe — décision prise et assumée, mais le refus est
possible. Le repli est déjà dans le code : une variable sur le serveur ferme la
vente sur iOS, sans reconstruire l'application, et les membres souscrivent
alors depuis un navigateur.

**Les comptes de démonstration.** Ils portent tous le même mot de passe et
doivent disparaître de la base avant l'ouverture au public. C'est noté, ce
n'est pas un oubli — mais c'est une date à tenir.

---

## 6. Une question à lui poser, qu'il n'a peut-être pas vue

La période de lancement est réglée sur le **15 septembre 2027** : jusque-là,
tout le monde accède aux échanges sans payer. C'est une année complète de
gratuité. Est-ce bien ce qu'il veut ? C'est une variable qui se change en une
ligne, mais elle décide de la date à laquelle la société commence à encaisser.

---

## 7. Ce que tu peux proposer pour la suite

S'il demande « et après ? » :

- Le **site web** avec une partie des fonctions de l'application. La base est
  déjà là — `apps/web` existe, et l'API est la même que celle du mobile. Le
  partage d'un logement deviendrait alors un vrai lien : quelqu'un reçoit une
  maison par message, l'ouvre dans son navigateur, découvre WIM sans rien
  installer.
- Une **mise en page pour tablette**. L'application fonctionne sur iPad, mais y
  affiche la disposition du téléphone, centrée. Un vrai dessin — colonnes, vue
  maître-détail — reste à faire.
