type Texte = { subject: string; text: string; html: string };

const FR: Texte = {
  subject: 'Votre logement attend ses premiers voyageurs',
  text: `Bonjour {{prenom}},

Votre compte WIM est prêt, mais votre logement n’y est pas encore. Tant qu’il n’est pas publié, personne ne peut vous proposer d’échange.

Publier prend cinq minutes : quelques photos, une description, et une vérification de votre identité qui rassure les membres qui viendront chez vous.

Ouvrez l’application et touchez « Ajouter un logement ».`,
  html: `
    <p>Bonjour {{prenom}},</p>
    <p>Votre compte WIM est prêt, mais votre logement n’y est pas encore. Tant qu’il n’est pas publié, personne ne peut vous proposer d’échange.</p>
    <p>Publier prend cinq minutes : quelques photos, une description, et une vérification de votre identité qui rassure les membres qui viendront chez vous.</p>
    <p>Ouvrez l’application et touchez «&nbsp;Ajouter un logement&nbsp;».</p>
  `,
};

const EN: Texte = {
  subject: 'Your home is waiting for its first guests',
  text: `Hello {{prenom}},

Your WIM account is ready, but your home is not on it yet. Until it is published, nobody can offer you an exchange.

Publishing takes five minutes: a few photos, a description, and an identity check that reassures the members who will stay at your place.

Open the app and tap “Add a home”.`,
  html: `
    <p>Hello {{prenom}},</p>
    <p>Your WIM account is ready, but your home is not on it yet. Until it is published, nobody can offer you an exchange.</p>
    <p>Publishing takes five minutes: a few photos, a description, and an identity check that reassures the members who will stay at your place.</p>
    <p>Open the app and tap “Add a home”.</p>
  `,
};

const NOTIFICATIONS = {
  fr: {
    title: 'Votre logement attend',
    body: 'Publiez-le en cinq minutes pour recevoir vos premières propositions d’échange.',
  },
  en: {
    title: 'Your home is waiting',
    body: 'Publish it in five minutes to receive your first exchange offers.',
  },
};

function personnaliser(texte: Texte, prenom: string | null | undefined): Texte {
  const nom = prenom?.trim() || '';
  const remplacer = (valeur: string) =>
    valeur.replace(/ ?\{\{prenom\}\}/g, nom ? ` ${nom}` : '');

  return {
    subject: texte.subject,
    text: remplacer(texte.text),
    html: remplacer(texte.html),
  };
}

export function buildIdentityReminderEmail(
  locale: string | null | undefined,
  prenom: string | null | undefined,
): Texte {
  return personnaliser(locale === 'en' ? EN : FR, prenom);
}

export function buildIdentityReminderNotification(
  locale: string | null | undefined,
): { title: string; body: string } {
  return NOTIFICATIONS[locale === 'en' ? 'en' : 'fr'];
}
