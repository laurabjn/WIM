import { Inject, Injectable, Logger } from '@nestjs/common';

import type { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import { EMAIL_SENDER } from 'src/interfaces/http/tokens/token';

@Injectable()
export class AdminAlertService {
  private readonly logger = new Logger(AdminAlertService.name);

  constructor(
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSenderPort,
  ) {}

  async signalementRecu(options: {
    reportId: string;
    reason: string;
    message: string | null;
    cible: string;
  }): Promise<void> {
    const destinataire = process.env.ADMIN_EMAIL?.trim();

    if (!destinataire) {
      this.logger.warn(
        'ADMIN_EMAIL absent : le signalement est enregistre mais personne n en est averti.',
      );

      return;
    }

    try {
      await this.emailSender.send({
        to: destinataire,
        subject: `Wim — nouveau signalement : ${options.reason}`,
        text: [
          `Motif : ${options.reason}`,
          `Concerne : ${options.cible}`,
          options.message ? `Contenu : ${options.message}` : null,
          '',
          `Identifiant du signalement : ${options.reportId}`,
          "Il est consultable dans l'espace administration de l'application.",
        ]
          .filter(Boolean)
          .join(String.fromCharCode(10)),
      });
    } catch (error) {
      this.logger.warn(
        `Alerte de signalement non envoyee : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
