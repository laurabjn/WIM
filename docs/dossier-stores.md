# Dossier des stores — WIM

Tout ce qu'App Store Connect et la Google Play Console vont demander, avec les
réponses déjà écrites. Chaque réponse vient du code ou de la politique de
confidentialité : rien n'est inventé. Ce qui reste à décider ou à obtenir est
signalé comme tel.

Identifiants de l'application : `com.wim.mobile` sur les deux plateformes,
version `1.0.0`, domaine `worldismine.fr`, projet EAS `b59c258a-7edd-41c4-a766-8b8ea9dabc9e`.

---

## 1. Ce qui bloquerait le premier envoi

### 1.1 Les autorisations iOS — corrigé sur cette branche

L'application demandait l'appareil photo, la photothèque et la position sans
déclarer pourquoi. iOS ne prévient pas : il tue l'application à la seconde où
l'autorisation est demandée, et Apple refuse le binaire à l'envoi. Quatre écrans
étaient concernés — la photo de profil à l'inscription, les photos du logement,
l'appareil photo dans une conversation, et la géolocalisation d'une adresse.

Les phrases sont maintenant dans `apps/mobile/app.json`, en français :

| Clé | Phrase |
| --- | --- |
| `NSCameraUsageDescription` | Wim utilise l'appareil photo pour envoyer une photo dans une conversation. |
| `NSPhotoLibraryUsageDescription` | Wim accède à vos photos pour illustrer votre profil, votre logement et vos messages. |
| `NSLocationWhenInUseUsageDescription` | Wim utilise votre position pour situer votre logement et trouver les échanges autour de vous. |
| `NSFaceIDUsageDescription` | Wim utilise Face ID pour protéger vos identifiants de connexion. |

Les deux variantes « localisation en permanence » ont été retirées : l'application
ne s'en sert pas, et les déclarer fait poser des questions à la revue.

Le dossier `android/` et le dossier `ios/` sont ignorés par git : EAS les
régénère à chaque build depuis `app.json`, donc le prochain build les aura. En
local, `expo run:android` réutilise le dossier existant — il faut le supprimer
pour voir la différence.

### 1.2 Les pages légales doivent être en ligne

Les deux stores demandent une URL de politique de confidentialité **joignable
publiquement** au moment de l'envoi, et la refusent si elle renvoie une erreur.
La branche `feat/pages-legales` contient les deux pages, avec six trous que seul
le client peut combler : raison sociale, forme juridique, SIREN et adresse du
siège ; l'adresse e-mail de contact ; la date de publication ; le médiateur de la
consommation ; sa position sur l'assurance ; la durée de conservation des
signalements traités.

Tant que le site n'est pas hébergé, ni l'un ni l'autre store n'acceptera la fiche,
et les deux liens légaux des réglages de l'application ne mènent nulle part.

### 1.3 Les promesses de la page Abonnement ne sont pas tenables

La maquette du client fait afficher, sur la page d'abonnement, quatre phrases,
dans `packages/i18n/src/locales/fr.json`. Trois posent problème, parce qu'elles
décrivent une application qui n'a encore aucun membre. Apple refuse les fiches
et les captures dont le contenu ne correspond pas à l'application, et en France
une promesse invérifiable est une
pratique commerciale trompeuse : le risque est sur la société du client, pas
sur le store.

| Phrase d'origine | État |
| --- | --- |
| « Profitez de 12 mois d'échanges illimités ! » | Vraie : c'est l'abonnement annuel |
| « Voyagez chez plus de 200 000 membres dans 155 pays » | Remplacée par « Voyagez chez d'autres membres, sans loyer ni commission » |
| « Échange garanti ou 2ème année offerte » | Gardée, à la demande du client — devenue une clause des conditions |
| « Assistance aux membres 24h/24 et 7j/7 » | Gardée, à la demande du client — devenue une clause des conditions |

Le compte de membres a été retiré : aucun chiffre ne remplace un chiffre faux,
la phrase dit maintenant ce que l'abonnement donne.

Le client tient aux deux autres. Elles restent donc affichées, et elles sont
désormais écrites dans les conditions d'utilisation, sur la branche
`feat/pages-legales` : une section « Assistance », et une clause « Garantie
d'échange » dans la section Abonnement. C'est ce qui les fait passer du slogan
à l'engagement — et c'est aussi ce qu'un relecteur, ou un membre mécontent,
ira lire.

Ce qui reste à obtenir de lui pour que ces clauses tiennent debout :

- ce qui compte comme échange conclu, et ce que le membre doit avoir fait pour
  avoir droit à la garantie. Sans ces bornes, la clause se retourne contre sa
  société au premier litige : quelqu'un qui n'a jamais publié de logement
  pourrait réclamer sa deuxième année ;
- le délai pour réclamer la garantie après l'échéance, et l'adresse où la
  réclamer ;
- par où passe l'assistance, dans quelle langue elle répond, et sous quel
  délai. Apple exige de toute façon une URL d'assistance qui fonctionne, et un
  relecteur peut l'essayer.

### 1.4 Les comptes de démonstration

`apps/api/prisma/seed-demo.js` crée des comptes avec un mot de passe unique et
connu. Ils doivent disparaître de la base de production avant l'ouverture.

En revanche Apple **exige** un compte de test qui fonctionne, fourni dans les
« informations de revue », sans quoi le refus est automatique. Il en faut donc
un, créé à la main, avec :

- un logement publié et des photos,
- une conversation en cours,
- l'abonnement actif, pour que le relecteur voie ce que l'abonnement ouvre,
- l'identité déjà vérifiée, sinon le relecteur bute sur la vérification Stripe.

Mettre son adresse et son mot de passe dans le champ prévu, et dans les notes :
comment atteindre un échange, et le fait que la vérification d'identité est
déjà franchie sur ce compte.

### 1.5 iPad : soutenu

L'application est déclarée pour iPad. Apple exige donc un jeu de captures iPad
et essaie l'application sur cet écran : un rendu manifestement cassé est un
motif de refus.

Six écrans mesuraient la fenêtre une seule fois, au chargement du fichier, et
rangeaient cette valeur dans une feuille de styles figée au même instant :
`HomeHero`, `SearchResultCard`, `SearchResultsScreen`, `SwipehomeCard`,
`SwipeDetailsHomeScreen` et `OnboardingScreen`. Sur un téléphone la question ne
se pose pas, l'orientation étant bloquée en portrait. Sur iPad, Expo autorise
les quatre orientations : une simple rotation suffisait à les laisser dessinés
pour une largeur qui n'existait plus.

Les six passent désormais par `useDimensionsEcran`, dans
`src/shared/ui/dimensions.ts`, qui lit la fenêtre à chaque rendu et plafonne la
largeur du contenu à 520 points. Sous cette valeur — tout téléphone, l'iPhone
le plus large faisant 430 points — le comportement est identique au précédent,
au pixel près. Au-dessus, les cartes et les carrousels cessent de s'étirer et
se centrent. L'affiche d'un logement, elle, garde toute la largeur mais ne
dépasse plus 60 % de la hauteur, sans quoi une photo carrée sur un iPad
repousserait tout le reste sous la ligne de flottaison.

Le verrou plein écran a donc été retiré : l'application accepte le partage
d'écran et Slide Over, puisque ses mises en page suivent la fenêtre.

Ce qui n'est pas fait : aucune mise en page propre à la tablette — pas de
colonnes, pas de vue maître-détail. Sur un grand écran, c'est la mise en page
du téléphone, centrée dans une colonne lisible. Apple l'accepte sans
difficulté ; un vrai dessin pour tablette reste un chantier à part.

---

## 2. Le vrai risque de la revue Apple : l'abonnement hors achat intégré

Apple demande que tout abonnement qui ouvre une fonction de l'application passe
par l'achat intégré, avec sa commission. WIM encaisse par Stripe, décision prise
et assumée. Les exceptions d'Apple — presse, applications « reader », achats de
biens physiques — ne s'appliquent pas ici.

Le refus est donc possible. Le plan de repli est déjà dans le code et ne demande
aucun nouveau build : le serveur décide par plateforme si la vente est ouverte
(`venteAutorisee`), et l'application affiche alors le message déjà traduit
`subscription.saleOutsideApp` — « L'abonnement ne se souscrit pas depuis
l'application. Vous pouvez le prendre depuis un navigateur, avec le même
compte. » Une variable d'environnement sur le VPS suffit à basculer.

Deux précautions qui font la différence à la revue :

- ne mettre aucun bouton ni aucun lien vers le paiement web dans la version iOS
  soumise, tant que la question n'est pas tranchée ;
- ne pas mentionner de prix dans les captures iOS.

---

## 3. Confidentialité de l'app — App Store Connect

Apple demande, pour chaque type de donnée : est-elle collectée, est-elle liée à
l'identité de la personne, sert-elle au suivi publicitaire, et pourquoi.

**Suivi : non, sur toute la ligne.** L'application n'embarque ni mesure
d'audience, ni traceur publicitaire. Il ne faut donc **pas** cocher « utilisée
pour le suivi », et aucune demande d'autorisation de suivi (ATT) n'est à ajouter.

| Type de donnée Apple | Collectée | Liée à l'identité | Finalité |
| --- | --- | --- | --- |
| Coordonnées — e-mail, nom, prénom, téléphone | Oui | Oui | Fonctionnalité de l'app |
| Contenu utilisateur — photos, messages, messages vocaux, avis | Oui | Oui | Fonctionnalité de l'app |
| Identifiants — identifiant de compte, identifiant d'appareil pour les notifications | Oui | Oui | Fonctionnalité de l'app |
| Achats — statut et dates de l'abonnement | Oui | Oui | Fonctionnalité de l'app |
| Localisation approximative — ville et zone du logement | Oui | Oui | Fonctionnalité de l'app |
| Localisation précise — coordonnées du logement, jamais montrées publiquement | Oui | Oui | Fonctionnalité de l'app |
| Informations sensibles — pièce d'identité et photographie, reçues par Stripe Identity | Oui | Oui | Fonctionnalité de l'app |
| Diagnostics — pannes, modèle d'appareil, pile d'appels | Oui | Oui | Fonctionnalité de l'app |
| Données d'utilisation | Non | — | — |
| Historique de navigation, de recherche sur le web | Non | — | — |
| Contacts, santé, finances, messages d'autres applications | Non | — | — |

Deux nuances à savoir défendre si Apple pose la question :

- **Informations sensibles.** WIM ne reçoit jamais la pièce d'identité : Stripe
  la reçoit directement et ne renvoie qu'un verdict. Apple demande néanmoins de
  déclarer ce que les partenaires collectent dans l'application, d'où le « oui ».
- **Diagnostics.** Ils ne partent que si la personne a activé « Partage de
  données » dans ses réglages, désactivé par défaut. Apple n'a pas de case
  « facultatif » : on déclare, et on le dit dans la fiche.

---

## 4. Sécurité des données — Google Play Console

Même exercice, vocabulaire différent. Deux colonnes comptent particulièrement :
« collectée » et « partagée ».

**Partagée : non, partout.** Google ne considère pas comme un partage le fait de
confier des données à un sous-traitant qui les traite pour votre compte — c'est
le cas de Stripe, DeepL, Mapbox, Sentry, OVH et Firebase. Rien n'est cédé à un
annonceur ni à un courtier.

| Type de donnée | Collectée | Obligatoire | Finalité |
| --- | --- | --- | --- |
| Nom | Oui | Obligatoire | Fonctionnalité de l'app |
| Adresse e-mail | Oui | Obligatoire | Fonctionnalité, identification |
| Numéro de téléphone | Oui | Facultatif | Fonctionnalité de l'app |
| Autres informations personnelles — date de naissance, nationalité, langues | Oui | Obligatoire | Fonctionnalité de l'app |
| Pièce d'identité | Oui | Facultatif | Fonctionnalité, prévention de la fraude |
| Position approximative | Oui | Obligatoire | Fonctionnalité de l'app |
| Position précise | Oui | Facultatif | Fonctionnalité de l'app |
| Photos | Oui | Facultatif | Fonctionnalité de l'app |
| Fichiers audio — messages vocaux | Oui | Facultatif | Fonctionnalité de l'app |
| Messages dans l'application | Oui | Facultatif | Fonctionnalité de l'app |
| Historique d'achats | Oui | Obligatoire | Fonctionnalité de l'app |
| Actions dans l'application | Oui | Obligatoire | Fonctionnalité, personnalisation |
| Identifiants d'appareil ou autres | Oui | Obligatoire | Fonctionnalité de l'app |
| Journaux de plantage et diagnostics | Oui | Facultatif | Diagnostics |

Les trois questions transversales :

- **Chiffrées en transit ?** Oui — tout passe en HTTPS, la base n'est joignable
  depuis Internet par aucun moyen direct.
- **Suppression possible ?** Oui, depuis l'application : Profil → Réglages →
  Supprimer mon compte, en deux confirmations, effacement immédiat. Donner aussi
  l'adresse de contact des pages légales, Google demande un moyen hors
  application.
- **Collecte facultative ?** Les lignes marquées « facultatif » ci-dessus ne
  partent que si la personne les fournit — un message vocal, une photo, la
  vérification d'identité, le partage de diagnostics.

---

## 5. Classification par âge

Les conditions réservent WIM aux personnes majeures : il faut demander la
tranche adulte des deux côtés, et ne pas essayer de descendre.

Ce qui déclenche cette tranche, et qu'il faut déclarer honnêtement :

- les membres échangent des messages, des photos et des enregistrements sans
  modération préalable ;
- les membres se rencontrent physiquement et dorment chez l'autre ;
- l'application partage une position approximative.

Apple attend, pour toute application à contenu produit par les membres
(règle 1.2), quatre choses. Elles existent toutes, et il faut le dire dans les
notes de revue :

| Exigence | Où elle est |
| --- | --- |
| Signaler un contenu ou un membre | Menu « ⓘ » d'une conversation → Signaler, six motifs |
| Bloquer un membre | Même menu → Bloquer |
| Filtrer et traiter les abus | Back-office d'administration : étudier un compte signalé, le suspendre |
| Coordonnées de l'éditeur publiées | Pages légales, une fois l'adresse de contact fournie |

Deux autres règles sont déjà satisfaites, autant le signaler : la suppression du
compte depuis l'application (règle 5.1.1 v), et « Se connecter avec Apple »
offert partout où « Se connecter avec Google » l'est (règle 4.8).

---

## 6. Les textes de la fiche

À relire par le client avant publication : c'est sa société qui les signe.

### Français

**Nom** (30 caractères maximum)
`WIM — Échange de maisons`

**Sous-titre Apple** (30 caractères)
`Votre maison ouvre le monde`

**Texte promotionnel Apple** (170 caractères, modifiable sans nouvelle version)
`Ouvrez votre porte, le monde vous ouvre la sienne. Trouvez un logement, convenez des dates, partez. Sans loyer, sans intermédiaire.`

**Description**

```
Et si votre maison devenait votre passeport ?

WIM met en relation des particuliers qui échangent leur logement le temps d'un
séjour. Pas de loyer, pas de commission sur la nuitée : vous vous accueillez
mutuellement.

COMMENT ÇA MARCHE

1. Publiez votre logement — photos, ville, capacité, périodes où il est libre.
2. Explorez. Faites défiler les logements, gardez ceux qui vous plaisent.
3. Quand l'intérêt est réciproque, la conversation s'ouvre.
4. Convenez des dates, confirmez l'échange, partez.

CE QUE VOUS Y TROUVEREZ

• Une exploration par cartes, par ville ou par carte géographique
• Des conversations traduites automatiquement : écrivez dans votre langue,
  votre interlocuteur lit dans la sienne
• Des messages vocaux, des photos, la relecture de ce qui a été dit
• Un calendrier de disponibilités et des dates qui se négocient dans la
  conversation
• Des avis laissés après chaque séjour
• Une vérification d'identité par pièce officielle, demandée au moment de
  publier ou de proposer un échange

LA VIE PRIVÉE, CONCRÈTEMENT

L'adresse exacte de votre logement n'est jamais publique : la fiche montre une
zone d'environ cinq kilomètres. Vos hôtes ne la reçoivent qu'une fois l'échange
convenu. Aucun traceur publicitaire, aucune mesure d'audience, aucune donnée
vendue. Vous pouvez supprimer votre compte depuis l'application, en deux
confirmations, et tout disparaît.

L'ABONNEMENT

Publier un logement, explorer et discuter restent libres. L'abonnement annuel
ouvre les échanges eux-mêmes. Tarif réduit de moitié pour les étudiants, sur
présentation d'une adresse e-mail d'école. Parrainez, et vous gagnez tous les
deux une année.
```

**Mots-clés Apple** (100 caractères, séparés par des virgules, sans espaces)
`échange,maison,logement,voyage,vacances,séjour,hôte,troc,voyageur,home,exchange`

### English

**Name**
`WIM — Home Exchange`

**Subtitle**
`Your home opens the world`

**Promotional text**
`Open your door, and the world opens its own. Find a home, agree on the dates, go. No rent, no middleman.`

**Description**

```
What if your home were your passport?

WIM brings together people who swap homes for a stay. No rent, no commission on
the nights: you host each other.

HOW IT WORKS

1. List your home — photos, city, how many it sleeps, when it is free.
2. Explore. Go through the homes, keep the ones you like.
3. When the interest is mutual, the conversation opens.
4. Agree on the dates, confirm the exchange, go.

WHAT YOU WILL FIND

• Browsing by cards, by city or on a map
• Conversations translated as they happen: write in your language, the other
  person reads in theirs
• Voice messages, photos, and a record of what was said
• An availability calendar, and dates settled inside the conversation
• Reviews left after every stay
• Identity verification by official document, asked for when you list a home or
  propose an exchange

PRIVACY, IN PRACTICE

Your home's exact address is never public: the listing shows an area of roughly
five kilometres. Your guests receive it only once the exchange is agreed. No
advertising trackers, no audience measurement, no data sold. You can delete your
account from the app, in two confirmations, and everything goes with it.

THE SUBSCRIPTION

Listing a home, exploring and talking stay free. The yearly subscription opens
the exchanges themselves. Half price for students, with a school email address.
Refer someone and you both gain a year.
```

**Keywords**
`home,exchange,swap,house,travel,holiday,stay,host,traveller,vacation`

---

## 7. Les captures d'écran

### Les écrans à montrer, dans cet ordre

1. **Explorer** — l'affiche de la ville, les catégories, les dernières
   recherches. C'est la première impression.
2. **Le défilement des logements** — une belle photo, le geste de tri.
3. **La fiche d'un logement** — la feuille qui remonte sur la photo, les
   équipements, la zone approximative sur la carte.
4. **Une conversation** — de préférence avec la traduction automatique visible,
   c'est ce qui distingue l'application.
5. **L'échange confirmé** — le bandeau avec les deux logements et les dates.
6. **Le profil vérifié** — le badge d'identité, les avis.

Ne pas montrer la page Abonnement sur iOS tant que la question de l'achat
intégré n'est pas tranchée.

### Les formats

À confirmer dans chaque console au moment de l'envoi : Apple a changé ces
exigences plusieurs fois.

| Store | Élément | Format |
| --- | --- | --- |
| Apple | Captures iPhone 6,9" | 1290 × 2796 ou 1320 × 2868, de 3 à 10 |
| Apple | Captures iPad 13" | Obligatoires : 2064 × 2752 ou 2048 × 2732, de 3 à 10 |
| Apple | Icône | 1024 × 1024 PNG, sans transparence, sans coins arrondis |
| Google Play | Captures téléphone | 2 à 8, entre 320 et 3840 px, le plus simple : 1080 × 1920 |
| Google Play | Image de présentation | 1024 × 500 |
| Google Play | Icône | 512 × 512 PNG |

Le plus simple : prendre les captures sur un iPhone 16 Pro Max et un iPad Pro
13 pouces au simulateur
pour Apple, et sur ton téléphone pour Google.

---

## 8. Les champs administratifs

| Champ | Valeur | Qui la fournit |
| --- | --- | --- |
| Catégorie principale | Voyage | — |
| Catégorie secondaire | Style de vie | — |
| URL de la politique de confidentialité | `https://worldismine.fr/confidentialite` | branche `feat/pages-legales` |
| URL des conditions d'utilisation | `https://worldismine.fr/conditions` | idem |
| URL d'assistance | Une page ou une adresse e-mail joignable | client |
| URL marketing | Facultative | client |
| Copyright | © <année> <raison sociale> | client |
| Adresse, téléphone et e-mail de contact de la revue | — | client |
| Compte de test pour la revue | Voir 1.4 | toi |
| Chiffrement | Déjà déclaré : `ITSAppUsesNonExemptEncryption: false` — HTTPS seul, pas de déclaration d'export à faire | — |

---

## 9. Ce que personne d'autre que le client ne peut donner

À lui redemander en une seule fois, c'est la dernière liste qui bloque :

1. Le capital social et le nom du président, qui sera directeur de la
   publication. Le reste de l'identité de la société est en place : RED ROCKS,
   SAS, RCS Bordeaux 995 355 179, 36 rue Gabriel Fauré, 33400 Talence.
2. L'adresse e-mail de contact, publiée et relevée.
3. Le médiateur de la consommation retenu, avec ses coordonnées.
4. Sa position sur l'assurance des séjours.
5. La durée de conservation des signalements traités.
6. Les bornes de la garantie d'échange : ce qui compte comme échange conclu, ce
   que le membre doit avoir fait pour y avoir droit, le délai et l'adresse pour
   la réclamer (voir 1.3).
7. Le canal de l'assistance permanente, sa langue et son délai de réponse.
8. Le compte développeur Apple, à créer à son nom de société, et l'hébergement
   du site.
