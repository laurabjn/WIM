export type IssueIdentite =
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'NOT_VERIFIED'
  | 'REFUSED';

type Texte = { subject: string; text: string; html: string };

const FR: Record<IssueIdentite, Texte> = {
  IN_PROGRESS: {
    subject: 'Votre vérification d’identité est en cours d’examen',
    text: `Bonjour,

Nous avons bien reçu vos documents. Leur examen peut prendre jusqu’à 24 heures.

Vous n’avez rien à faire : nous vous préviendrons dès que le résultat sera connu.`,
    html: `
      <p>Bonjour,</p>
      <p>Nous avons bien reçu vos documents. Leur examen peut prendre jusqu’à 24 heures.</p>
      <p>Vous n’avez rien à faire : nous vous préviendrons dès que le résultat sera connu.</p>
    `,
  },
  VERIFIED: {
    subject: 'Votre identité est vérifiée',
    text: `Bonjour,

Votre identité a été vérifiée. Vous avez maintenant accès à l’ensemble de Wim.

Les autres membres verront que votre compte est vérifié, ce qui met en confiance au moment de convenir d’un échange.`,
    html: `
      <p>Bonjour,</p>
      <p>Votre identité a été vérifiée. Vous avez maintenant accès à l’ensemble de Wim.</p>
      <p>Les autres membres verront que votre compte est vérifié, ce qui met en confiance au moment de convenir d’un échange.</p>
    `,
  },
  NOT_VERIFIED: {
    subject: 'Votre vérification d’identité n’a pas abouti',
    text: `Bonjour,

Vos documents n’ont pas pu être validés. Cela arrive souvent pour une photo floue, mal cadrée ou prise à contre-jour.

Vous pouvez recommencer depuis l’application, autant de fois que nécessaire.`,
    html: `
      <p>Bonjour,</p>
      <p>Vos documents n’ont pas pu être validés. Cela arrive souvent pour une photo floue, mal cadrée ou prise à contre-jour.</p>
      <p>Vous pouvez recommencer depuis l’application, autant de fois que nécessaire.</p>
    `,
  },
  REFUSED: {
    subject: 'Votre vérification d’identité a été refusée',
    text: `Bonjour,

Votre vérification d’identité a été refusée et ne peut pas être relancée.

Si vous pensez qu’il s’agit d’une erreur, répondez à ce message et nous examinerons votre situation.`,
    html: `
      <p>Bonjour,</p>
      <p>Votre vérification d’identité a été refusée et ne peut pas être relancée.</p>
      <p>Si vous pensez qu’il s’agit d’une erreur, répondez à ce message et nous examinerons votre situation.</p>
    `,
  },
};

const EN: Record<IssueIdentite, Texte> = {
  IN_PROGRESS: {
    subject: 'Your identity verification is under review',
    text: `Hello,

We have received your documents. The review can take up to 24 hours.

There is nothing to do on your side: we will let you know as soon as the result is available.`,
    html: `
      <p>Hello,</p>
      <p>We have received your documents. The review can take up to 24 hours.</p>
      <p>There is nothing to do on your side: we will let you know as soon as the result is available.</p>
    `,
  },
  VERIFIED: {
    subject: 'Your identity is verified',
    text: `Hello,

Your identity has been verified. You now have access to all of Wim.

Other members can see that your account is verified, which helps build trust when agreeing on an exchange.`,
    html: `
      <p>Hello,</p>
      <p>Your identity has been verified. You now have access to all of Wim.</p>
      <p>Other members can see that your account is verified, which helps build trust when agreeing on an exchange.</p>
    `,
  },
  NOT_VERIFIED: {
    subject: 'Your identity verification did not complete',
    text: `Hello,

Your documents could not be validated. This often happens with a blurry photo, a bad framing, or a backlit shot.

You can start again from the app, as many times as needed.`,
    html: `
      <p>Hello,</p>
      <p>Your documents could not be validated. This often happens with a blurry photo, a bad framing, or a backlit shot.</p>
      <p>You can start again from the app, as many times as needed.</p>
    `,
  },
  REFUSED: {
    subject: 'Your identity verification was refused',
    text: `Hello,

Your identity verification was refused and cannot be started again.

If you believe this is a mistake, reply to this message and we will look into it.`,
    html: `
      <p>Hello,</p>
      <p>Your identity verification was refused and cannot be started again.</p>
      <p>If you believe this is a mistake, reply to this message and we will look into it.</p>
    `,
  },
};

const NOTIFICATIONS: Record<'fr' | 'en', Record<IssueIdentite, { title: string; body: string }>> = {
  fr: {
    IN_PROGRESS: {
      title: 'Vérification en cours',
      body: 'Vos documents sont en cours d’examen. Comptez jusqu’à 24 heures.',
    },
    VERIFIED: {
      title: 'Identité vérifiée',
      body: 'Vous avez maintenant accès à l’ensemble de Wim.',
    },
    NOT_VERIFIED: {
      title: 'Vérification à recommencer',
      body: 'Vos documents n’ont pas pu être validés. Vous pouvez réessayer.',
    },
    REFUSED: {
      title: 'Vérification refusée',
      body: 'Votre vérification d’identité a été refusée.',
    },
  },
  en: {
    IN_PROGRESS: {
      title: 'Verification under review',
      body: 'Your documents are being reviewed. This can take up to 24 hours.',
    },
    VERIFIED: {
      title: 'Identity verified',
      body: 'You now have access to all of Wim.',
    },
    NOT_VERIFIED: {
      title: 'Verification to start again',
      body: 'Your documents could not be validated. You can try again.',
    },
    REFUSED: {
      title: 'Verification refused',
      body: 'Your identity verification was refused.',
    },
  },
};

export function buildIdentityOutcomeEmail(
  locale: string | null | undefined,
  issue: IssueIdentite,
): Texte {
  return (locale === 'en' ? EN : FR)[issue];
}

export function buildIdentityOutcomeNotification(
  locale: string | null | undefined,
  issue: IssueIdentite,
): { title: string; body: string } {
  return NOTIFICATIONS[locale === 'en' ? 'en' : 'fr'][issue];
}
