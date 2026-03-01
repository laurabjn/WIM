export function buildPasswordResetEmail(locale: 'fr' | 'en', resetUrl: string) {
  if (locale === 'en') {
    return {
      subject: 'Reset your password',
      text: `Hello,

To reset your password, click the link below:
${resetUrl}

If you did not request this, you can ignore this email.`,
      html: `
        <p>Hello,</p>
        <p>To reset your password, click the link below:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    };
  }

  // default FR
  return {
    subject: 'Réinitialisation de votre mot de passe',
    text: `Bonjour,

Pour réinitialiser votre mot de passe, cliquez sur ce lien :
${resetUrl}

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
    html: `
      <p>Bonjour,</p>
      <p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
    `,
  };
}
