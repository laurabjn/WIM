# Textes du site worldismine.fr

Le site en ligne décrit une application d'échange d'objets entre particuliers.
L'application échange des **logements**. Ces textes remplacent les paragraphes
existants, page par page, sans toucher à la structure ni au graphisme du site.

À relire par l'éditeur avant mise en ligne : c'est sa société qui les signe.

---

## Accueil

### Titre

World Is Mine

### Chapeau

World Is Mine est une application mobile d'échange de logements entre
particuliers, éditée par RED ROCKS SAS, société française basée en Gironde.

### Corps

RED ROCKS SAS est une société par actions simplifiée immatriculée en France.
Elle développe et exploite sous la marque World Is Mine une application mobile
destinée aux plateformes iOS et Android. L'ensemble de la conception, du
développement et de l'exploitation du service est assuré par l'équipe de la
société.

L'application permet à ses membres d'ouvrir leur logement à d'autres
particuliers et de séjourner chez eux en retour, sans loyer ni commission sur
les nuitées. Le détail du fonctionnement est présenté sur la page Application.

Ce site présente la société, son activité, l'application qu'elle édite, ainsi
que les informations légales et les moyens de nous contacter. Il est mis à jour
au fur et à mesure de l'avancement du projet.

### Ce que nous faisons

**Conception produit.** Nous concevons les parcours d'échange, de la
publication d'un logement jusqu'à la remise des clés, en nous appuyant sur les
retours d'un panel d'utilisateurs testeurs. Chaque écran est éprouvé avant
d'entrer en développement.

**Développement mobile.** L'application est développée pour iOS et Android à
partir d'une base de code commune, et publiée sur les deux plateformes.

**Exploitation et sécurité.** Nous hébergeons le service en France, chez OVH,
et assurons la modération des contenus publiés par les membres.

---

## Application

### Chapeau

World Is Mine est une application mobile d'échange de logements entre
particuliers : vous ouvrez votre porte, et le monde vous ouvre la sienne.

### Comment cela fonctionne

1. **Vous publiez votre logement** — des photos, la ville, le nombre de
   personnes qu'il accueille, les périodes où il est libre.
2. **Vous explorez** les logements des autres membres, par cartes, par ville ou
   sur une carte géographique, et vous gardez ceux qui vous plaisent.
3. **Quand l'intérêt est réciproque**, la conversation s'ouvre entre vous.
4. **Vous convenez des dates**, vous confirmez l'échange, et vous partez.

### Ce que l'application apporte

**Des conversations traduites.** Chacun écrit dans sa langue et lit dans la
sienne : la traduction se fait au fil des messages.

**Un calendrier de disponibilités**, et des dates qui se négocient directement
dans la conversation.

**Des avis après chaque séjour**, qui construisent la réputation des membres.

**Une vérification d'identité.** Avant de publier un logement ou de proposer un
échange, chaque membre vérifie son identité par une pièce officielle. La
vérification est effectuée par un prestataire spécialisé : les documents ne
transitent pas par nos serveurs.

**Le signalement et le blocage.** Chaque membre peut signaler une annonce ou un
autre membre, et le bloquer. Les signalements sont traités par notre équipe.

### La vie privée, concrètement

L'adresse exacte d'un logement n'est jamais publique : la fiche affiche une
zone d'environ cinq kilomètres de rayon. Vos futurs hôtes ne la reçoivent
qu'une fois l'échange convenu entre vous.

L'application ne contient aucun traceur publicitaire ni outil de mesure
d'audience, et aucune donnée n'est vendue. Chaque membre peut, depuis
l'application, récupérer l'ensemble de ses données ou supprimer son compte.

### L'abonnement

Publier un logement, explorer et discuter sont libres. Un abonnement annuel de
25 € ouvre les échanges eux-mêmes. TVA non applicable, article 293 B du code
général des impôts.

Un tarif réduit de moitié est accordé aux étudiants sur présentation d'une
adresse e-mail d'établissement. Le parrainage offre une année d'abonnement au
parrain comme au filleul.

> **Note pour l'éditeur.** Ce dernier bloc peut être allégé si vous ne
> souhaitez pas afficher le prix avant l'ouverture. En revanche, l'existence
> d'un abonnement payant doit rester mentionnée : c'est sur ce site que votre
> prestataire de paiement vérifie la nature de votre activité, et une
> incohérence découverte après coup gèle les virements.

---

## Société

Conserver la page existante. Deux corrections :

- remplacer « application mobile d'échange d'objets » par « application mobile
  d'échange de logements » partout où la formule apparaît ;
- ajouter le **capital social**, absent de la page alors que la loi impose à une
  SAS de le publier.

Vérifier au passage que le prénom du dirigeant est le même sur la page Société
et dans l'adresse e-mail de contact : les deux ne concordent pas aujourd'hui.

---

## Contact

Conserver la page existante. Un point à trancher, et il ne peut pas rester en
l'état :

La page annonce une assistance **du lundi au vendredi, de 9h à 18h**, avec une
réponse **sous deux jours ouvrés**. L'application, elle, promet sur sa page
d'abonnement une **assistance 24h/24 et 7j/7**.

Les deux ne peuvent pas coexister. Soit la page Contact est alignée sur la
promesse de l'application, soit la promesse de l'application est alignée sur la
réalité de la page Contact. La seconde solution est la plus sûre : une promesse
de disponibilité permanente qu'on ne tient pas est une pratique commerciale
trompeuse, et elle est ici contredite par le site de l'éditeur lui-même.

---

## Pages à ajouter

Trois pages sont prêtes et doivent être déposées sur l'hébergement :

| Page | Adresse | Pourquoi |
| --- | --- | --- |
| Conditions d'utilisation | `/conditions.html` | Exigée par l'App Store et le Play Store |
| Politique de confidentialité | `/confidentialite.html` | Exigée par les deux, et par le RGPD |
| Assistance | `/assistance.html` | URL d'assistance exigée par App Store Connect |

S'y ajoute un fichier technique, `/.well-known/assetlinks.json`, qu'Android
vient lire pour rouvrir l'application sur un lien du domaine. Sans lui, la
vérification d'identité se termine dans le navigateur au lieu de revenir dans
l'application.

Ces fichiers sont dans le dépôt, dans `deploy/site/`.
