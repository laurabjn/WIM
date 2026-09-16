import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PushSenderService } from 'src/application/notification/push-sender.service';
import type { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { EMAIL_SENDER } from 'src/interfaces/http/tokens/token';
import {
  buildIdentityReminderEmail,
  buildIdentityReminderNotification,
} from 'src/shared/utils/identity-reminder.template';

const JOUR_MS = 24 * 60 * 60 * 1000;
const DELAI_MS = 2 * JOUR_MS;
const LOT_MAX = 200;

@Injectable()
export class IdentityReminderService {
  private readonly logger = new Logger(IdentityReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushSender: PushSenderService,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSenderPort,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async envoyerLesRappels(): Promise<void> {
    try {
      const envoyes = await this.appliquer();

      if (envoyes) {
        this.logger.log(`${envoyes} rappel(s) de logement envoye(s).`);
      }
    } catch (error) {
      this.logger.warn(
        `Rappels de logement impossibles : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async appliquer(): Promise<number> {
    const limite = new Date(Date.now() - DELAI_MS);

    const comptes = await this.prisma.user.findMany({
      where: {
        createdAt: { lt: limite },
        isAdmin: false,
        suspendedAt: null,
        identityReminderSentAt: null,
        homes: { none: {} },
      },
      take: LOT_MAX,
      select: {
        id: true,
        email: true,
        firstName: true,
        preferredLocale: true,
      },
    });

    let envoyes = 0;

    for (const compte of comptes) {
      const courriel = buildIdentityReminderEmail(
        compte.preferredLocale,
        compte.firstName,
      );

      try {
        await this.emailSender.send({
          to: compte.email,
          subject: courriel.subject,
          text: courriel.text,
          html: courriel.html,
        });
      } catch (erreur: unknown) {
        this.logger.warn(`Rappel non envoye a ${compte.email} : ${erreur}`);

        continue;
      }

      const notification = buildIdentityReminderNotification(
        compte.preferredLocale,
      );

      await this.pushSender
        .sendToUser(compte.id, {
          title: notification.title,
          body: notification.body,
          data: { type: 'home_reminder' },
        })
        .catch((erreur: unknown) => {
          this.logger.warn(`Notification de rappel non envoyee : ${erreur}`);
        });

      await this.prisma.user.update({
        where: { id: compte.id },
        data: { identityReminderSentAt: new Date() },
      });

      envoyes += 1;
    }

    return envoyes;
  }
}
