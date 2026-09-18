type Texte = { subject: string; text: string; html: string };

export function buildStudentCodeEmail(
  locale: string | null | undefined,
  code: string,
  minutes: number,
): Texte {
  if (locale === 'en') {
    return {
      subject: `${code} is your WIM student code`,
      text: `Hello,

Here is your code to confirm your student status on WIM: ${code}

It is valid for ${minutes} minutes. If you did not request it, you can ignore this email.`,
      html: `
        <p>Hello,</p>
        <p>Here is your code to confirm your student status on WIM:</p>
        <p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p>
        <p>It is valid for ${minutes} minutes. If you did not request it, you can ignore this email.</p>
      `,
    };
  }

  return {
    subject: `${code} est votre code étudiant WIM`,
    text: `Bonjour,

Voici votre code pour confirmer votre statut étudiant sur WIM : ${code}

Il est valable ${minutes} minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.`,
    html: `
      <p>Bonjour,</p>
      <p>Voici votre code pour confirmer votre statut étudiant sur WIM :</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p>
      <p>Il est valable ${minutes} minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>
    `,
  };
}
