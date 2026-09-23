# Registre des activités de traitement — RED ROCKS / WIM

Brouillon à relire et à compléter par le responsable de traitement.

La « déclaration CNIL » n'existe plus : le RGPD l'a supprimée en mai 2018. Elle
est remplacée par ce registre, que l'entreprise tient elle-même, ne déclare à
personne, et présente à la CNIL si celle-ci le demande. Il est obligatoire dès
qu'on traite des données à caractère personnel de façon non occasionnelle, ce
qui est le cas ici.

Ce document est rempli d'après le code et la politique de confidentialité. Les
mentions en **gras entre crochets** sont les seules qui demandent une décision
ou une information de la société.

---

## Le responsable de traitement

| | |
| --- | --- |
| Raison sociale | RED ROCKS, société par actions simplifiée |
| Siège | 36 rue Gabriel Fauré, 33400 Talence |
| Immatriculation | RCS Bordeaux 995 355 179 |
| Représentant légal | **[nom et prénom du président]** |
| Contact données | **[adresse e-mail de contact]** |
| Délégué à la protection des données | Non désigné — non obligatoire ici : pas d'organisme public, pas de suivi à grande échelle, pas de traitement de données sensibles à titre principal |

---

## Traitement n° 1 — Gestion des comptes membres

**Finalité.** Créer et tenir le compte d'un membre, l'identifier à la connexion,
permettre aux autres membres de savoir à qui ils ont affaire.

**Base légale.** Exécution du contrat — les conditions d'utilisation acceptées à
l'inscription.

**Personnes concernées.** Les membres inscrits, majeurs.

**Données.** Adresse e-mail, empreinte du mot de passe, prénom, nom, photo de
profil, description, pays, langues parlées, date de naissance, nationalité,
numéro de téléphone, langue de l'interface, devise, unité de distance,
préférences de voyage, réglages de confidentialité.

**Destinataires.** Aucun hors sous-traitants (voir la liste en fin de document).

**Durée.** Tant que le compte existe. À sa suppression : effacement immédiat,
les sauvegardes conservant une copie quatorze jours.

---

## Traitement n° 2 — Publication des logements et mise en relation

**Finalité.** Publier une annonce, la rendre trouvable, proposer des logements
pertinents et permettre aux membres de se contacter.

**Base légale.** Exécution du contrat.

**Données.** Titre, description, ville, pays, coordonnées géographiques,
capacité, type, équipements, photos, véhicule éventuel, périodes de
disponibilité ; logements aimés ou écartés, correspondances, favoris,
historique des villes recherchées, date de dernière visite.

**Précaution.** L'adresse exacte n'est jamais publique : la fiche affiche une
zone d'environ cinq kilomètres de rayon. Elle n'est transmise qu'une fois
l'échange convenu.

**Durée.** Tant que le compte existe.

---

## Traitement n° 3 — Conversations entre membres

**Finalité.** Permettre de convenir d'un échange.

**Base légale.** Exécution du contrat.

**Données.** Messages écrits, messages vocaux, images échangées, traductions
générées, accusés de lecture.

**Destinataire particulier.** DeepL, pour la traduction automatique du texte
des messages.

**Durée.** Tant que les deux comptes existent : la suppression de l'un efface la
conversation.

---

## Traitement n° 4 — Échanges et avis

**Finalité.** Organiser les séjours et informer les membres suivants.

**Base légale.** Exécution du contrat.

**Données.** Dates, logements concernés, nombre de voyageurs, notes et
commentaires laissés après un séjour.

**Durée.** Tant que le compte existe. Après suppression, le séjour reste dans
l'historique de l'hôte, le nom remplacé par « Membre supprimé ».

---

## Traitement n° 5 — Vérification d'identité

**Finalité.** Garantir aux membres que leur interlocuteur est une personne
réelle, avant de publier un logement ou de demander un échange.

**Base légale.** Intérêt légitime — la sécurité des membres qui s'accueillent
chez eux. À documenter par une **[analyse de balance des intérêts]**, courte,
en cas de contrôle.

**Données.** Le verdict seul — vérifiée, en cours, refusée — et l'identifiant de
la session chez Stripe. **La pièce d'identité et la photographie ne sont jamais
reçues par WIM** : Stripe Identity les collecte directement.

**Sous-traitant.** Stripe Identity.

**Durée.** Tant que le compte existe. À sa suppression, WIM demande à Stripe
l'expurgation des documents.

---

## Traitement n° 6 — Abonnements et facturation

**Finalité.** Ouvrir les échanges aux membres abonnés, encaisser l'abonnement
annuel, appliquer le tarif étudiant et les récompenses de parrainage.

**Base légale.** Exécution du contrat, et obligation légale pour la
conservation des pièces comptables.

**Données.** Statut et dates de l'abonnement, identifiant du client chez Stripe,
code de parrainage, comptes parrainés, adresse e-mail d'école et date de fin de
validité du statut étudiant. **Aucun numéro de carte ne transite par les
serveurs de WIM.**

**Sous-traitant.** Stripe.

**Durée.** Les pièces comptables sont conservées **dix ans** par Stripe et par
la société, conformément à l'article L123-22 du code de commerce — cette durée
survit à la suppression du compte.

---

## Traitement n° 7 — Modération et sécurité

**Finalité.** Protéger les membres, traiter les signalements et les abus.

**Base légale.** Intérêt légitime.

**Données.** Signalements émis et reçus avec leur motif, comptes bloqués.

**Durée.** **[à fixer — un an après traitement est l'usage]**

---

## Traitement n° 8 — Notifications

**Finalité.** Avertir d'un message ou d'une demande d'échange.

**Base légale.** Exécution du contrat pour les notifications liées au service.
Aucune lettre d'information ni courriel commercial n'est envoyé.

**Données.** Identifiant technique de l'appareil, préférences de notification.

**Sous-traitants.** Expo et Google Firebase.

**Durée.** Tant que le compte existe.

---

## Traitement n° 9 — Diagnostic des pannes

**Finalité.** Comprendre et corriger les défauts de l'application.

**Base légale.** **Consentement** — désactivé par défaut, activable dans les
réglages sous « Partage de données ».

**Données.** Modèle de l'appareil, version du système, pile d'appels,
identifiant du compte. Jamais le contenu des conversations, ni les documents,
ni la saisie en cours.

**Sous-traitant.** Sentry.

**Durée.** Selon la rétention de Sentry, **[à vérifier dans le plan retenu]**.

---

## Les sous-traitants

| Sous-traitant | Ce qu'il reçoit | Hébergement | Contrat |
| --- | --- | --- | --- |
| OVH | L'ensemble des données, et l'envoi des courriels | France | **[contrat de sous-traitance à conserver]** |
| Stripe | E-mail, moyen de paiement, factures | Irlande / États-Unis | Clauses contractuelles types |
| Stripe Identity | Pièce d'identité et photographie | Irlande / États-Unis | Clauses contractuelles types |
| DeepL | Le texte des messages à traduire | Allemagne | — |
| Mapbox | Adresses recherchées et coordonnées | États-Unis | Clauses contractuelles types |
| Expo / Google Firebase | Identifiant technique de l'appareil | États-Unis | Clauses contractuelles types |
| Sentry | Détail technique d'une panne | **[à vérifier : UE ou États-Unis selon le plan]** | Clauses contractuelles types |
| Google et Apple | Identifiant de connexion, si ce mode est choisi | États-Unis | Clauses contractuelles types |

Les transferts hors Union européenne s'appuient sur les clauses contractuelles
types de la Commission. **[À confirmer auprès de chaque prestataire et à
conserver dans le dossier.]**

---

## Les mesures de sécurité

- Les échanges avec l'application sont chiffrés en transit (HTTPS/TLS).
- La base de données n'est exposée sur aucun port public : elle n'est joignable
  que depuis le réseau interne du serveur.
- Les mots de passe sont stockés sous forme d'empreintes irréversibles.
- Les accès au serveur se font par clé SSH.
- La base est sauvegardée quotidiennement, avec quatorze jours de rétention, et
  la restauration est éprouvée périodiquement.
- Aucune donnée de carte bancaire n'est stockée ni ne transite par nos serveurs.

---

## Les droits des personnes

| Droit | Comment il s'exerce aujourd'hui |
| --- | --- |
| Accès et portabilité | Depuis l'application : Réglages → Recevoir mes données. Le dossier part par courriel au format JSON. |
| Effacement | Depuis l'application : Réglages → Supprimer mon compte, en deux confirmations, effacement immédiat. |
| Rectification | Depuis l'application, page Modifier le profil. |
| Opposition, limitation | Par courriel à **[adresse de contact]**, réponse sous un mois. |
| Réclamation | CNIL, 3 place de Fontenoy, 75007 Paris, ou cnil.fr. |

---

## Ce qui reste à faire

1. Compléter les mentions entre crochets.
2. Dater et signer le registre, puis le revoir à chaque changement notable —
   nouveau sous-traitant, nouvelle finalité, nouvelle catégorie de données.
3. Conserver dans le même dossier : les contrats de sous-traitance, et la note
   justifiant l'intérêt légitime pour la vérification d'identité.
