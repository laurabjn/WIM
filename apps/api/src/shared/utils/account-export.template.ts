type Texte = { subject: string; text: string; html: string };

export function buildAccountExportEmail(
  locale: string | null | undefined,
  prenom: string | null | undefined,
): Texte {
  const nom = prenom?.trim() ? ` ${prenom.trim()}` : '';

  if (locale === 'en') {
    return {
      subject: 'Your WIM data',
      text: `Hello${nom},

Here is a copy of everything WIM holds about you, attached to this email as a JSON file: your account, your homes, your favourites, your searches, the messages you sent, your reviews, your subscription and your referrals.

JSON is a text format: any text editor opens it, and any other service can read it. That is what the law asks for — data you can take elsewhere.

Messages other members sent you are not included: they were written by them, not by you.

If you did not ask for this file, reply to this email as soon as possible.`,
      html: `
        <p>Hello${nom},</p>
        <p>Here is a copy of everything WIM holds about you, attached to this email as a JSON file: your account, your homes, your favourites, your searches, the messages you sent, your reviews, your subscription and your referrals.</p>
        <p>JSON is a text format: any text editor opens it, and any other service can read it. That is what the law asks for — data you can take elsewhere.</p>
        <p>Messages other members sent you are not included: they were written by them, not by you.</p>
        <p>If you did not ask for this file, reply to this email as soon as possible.</p>
      `,
    };
  }

  return {
    subject: 'Vos données WIM',
    text: `Bonjour${nom},

Voici une copie de tout ce que WIM conserve à votre sujet, jointe à ce message au format JSON : votre compte, vos logements, vos favoris, vos recherches, les messages que vous avez envoyés, vos avis, votre abonnement et vos parrainages.

Le JSON est un format texte : n’importe quel éditeur l’ouvre, et n’importe quel autre service peut le relire. C’est ce que la loi demande — des données que vous pouvez emporter ailleurs.

Les messages que d’autres membres vous ont écrits n’y figurent pas : ils ont été rédigés par eux, pas par vous.

Si vous n’êtes pas à l’origine de cette demande, répondez à ce message au plus vite.`,
    html: `
      <p>Bonjour${nom},</p>
      <p>Voici une copie de tout ce que WIM conserve à votre sujet, jointe à ce message au format JSON : votre compte, vos logements, vos favoris, vos recherches, les messages que vous avez envoyés, vos avis, votre abonnement et vos parrainages.</p>
      <p>Le JSON est un format texte : n’importe quel éditeur l’ouvre, et n’importe quel autre service peut le relire. C’est ce que la loi demande — des données que vous pouvez emporter ailleurs.</p>
      <p>Les messages que d’autres membres vous ont écrits n’y figurent pas : ils ont été rédigés par eux, pas par vous.</p>
      <p>Si vous n’êtes pas à l’origine de cette demande, répondez à ce message au plus vite.</p>
    `,
  };
}
