import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import type { PasswordResetTokenRepository } from '../../../domain/auth/repositories/password-reset-token-repository';
import { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import { buildPasswordResetEmail } from 'src/shared/utils/password-reset.template';

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly ttlSeconds: number,
    private readonly emailSender: EmailSenderPort,
    private readonly frontendUrl: string,
  ) {}

  async execute(
    email: string,
    locale: 'fr' | 'en',
  ): Promise<{ token: string | null }> {
    console.log('[FORGOT] usecase called with', email, locale);
    const user = await this.userRepository.findByEmail(email);

    console.log('[REQUEST PASSWORD RESET] User found:', !!user);

    if (!user) return { token: null };

    const token = await this.tokenRepository.sign(
      { userId: user.id },
      this.ttlSeconds,
    );

    const resetUrl = `${this.frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(
      token,
    )}`;

    console.log('[FORGOT] reset URL', resetUrl);

    const template = buildPasswordResetEmail(locale, resetUrl);

    console.log('[FORGOT] sending email to', user.email);

    await this.emailSender.send({
      to: user.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    console.log('[FORGOT] email send() finished');
  }
}
