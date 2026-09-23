type Texte = { subject: string; text: string; html: string };

export function buildAccountDeletedEmail(
  locale: string | null | undefined,
): Texte {
  if (locale === 'en') {
    return {
      subject: 'Your WIM account has been deleted',
      text: `Hello,

Your WIM account and everything attached to it — your homes, photos, conversations and subscription — have been deleted, as you asked.

If you did not request this, reply to this email as soon as possible.

Thank you for having been part of WIM. You are welcome back anytime.`,
      html: `
        <p>Hello,</p>
        <p>Your WIM account and everything attached to it — your homes, photos, conversations and subscription — have been deleted, as you asked.</p>
        <p>If you did not request this, reply to this email as soon as possible.</p>
        <p>Thank you for having been part of WIM. You are welcome back anytime.</p>
      `,
    };
  }

  return {
    subject: 'Votre compte WIM a été supprimé',
    text: `Bonjour,

Votre compte WIM et tout ce qui y était rattaché — vos logements, vos photos, vos conversations et votre abonnement — ont été supprimés, comme vous l’avez demandé.

Si vous n’êtes pas à l’origine de cette demande, répondez à ce message au plus vite.

Merci d’avoir fait partie de WIM. Vous serez toujours le bienvenu.`,
    html: `
      <p>Bonjour,</p>
      <p>Votre compte WIM et tout ce qui y était rattaché — vos logements, vos photos, vos conversations et votre abonnement — ont été supprimés, comme vous l’avez demandé.</p>
      <p>Si vous n’êtes pas à l’origine de cette demande, répondez à ce message au plus vite.</p>
      <p>Merci d’avoir fait partie de WIM. Vous serez toujours le bienvenu.</p>
    `,
  };
}
