import { Logger } from '@nestjs/common';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import type { PasswordResetTokenRepository } from '../../../domain/auth/repositories/password-reset-token-repository';
import { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import { buildPasswordResetEmail } from 'src/shared/utils/password-reset.template';

export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly ttlSeconds: number,
    private readonly emailSender: EmailSenderPort,
    private readonly frontendUrl: string,
  ) {}

  async execute(email: string, locale: 'fr' | 'en'): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // On ne dit jamais si le compte existe : la reponse du controleur est la
    // meme dans les deux cas, sinon l'endpoint revelerait qui est inscrit.
    if (!user) return;

    const token = await this.tokenRepository.sign(
      { userId: user.id },
      this.ttlSeconds,
    );

    const base = this.frontendUrl.replace(/\/$/, '');

    // La page vit sous un segment de langue : la viser directement evite une
    // redirection et sert la page dans la langue de la demande.
    const resetUrl = `${base}/${locale}/reset-password?token=${encodeURIComponent(
      token,
    )}`;

    const template = buildPasswordResetEmail(locale, resetUrl);

    try {
      await this.emailSender.send({
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      // Jamais le lien ni le jeton : les journaux permettraient alors de
      // reprendre n'importe quel compte.
      this.logger.log(`Lien de reinitialisation envoye a ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Envoi du lien de reinitialisation impossible pour ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }
}
