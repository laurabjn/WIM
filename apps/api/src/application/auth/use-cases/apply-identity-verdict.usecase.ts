import { Logger } from '@nestjs/common';

import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import type { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import {
  buildIdentityOutcomeEmail,
  buildIdentityOutcomeNotification,
  type IssueIdentite,
} from 'src/shared/utils/identity-outcome.template';

export class ApplyIdentityVerdictUseCase {
  private readonly logger = new Logger(ApplyIdentityVerdictUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly pushSender?: PushSenderService,
    private readonly emailSender?: EmailSenderPort,
  ) {}

  async execute(input: {
    userId: string;
    status: IdentityStatus;
  }): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) return;

    if (user.identityStatus === input.status) return;

    await this.userRepository.updateIdentityStatus(input.userId, input.status);

    await this.annoncer(
      input.userId,
      user.email,
      user.preferredLocale,
      input.status as unknown as IssueIdentite,
    );
  }

  private async annoncer(
    userId: string,
    email: string,
    locale: string,
    issue: IssueIdentite,
  ): Promise<void> {
    const notification = buildIdentityOutcomeNotification(locale, issue);

    if (this.pushSender) {
      await this.pushSender
        .sendToUser(userId, {
          title: notification.title,
          body: notification.body,
          data: { type: 'identity', status: issue },
        })
        .catch((erreur: unknown) => {
          this.logger.warn(`Notification d'identite non envoyee : ${erreur}`);
        });
    }

    if (this.emailSender) {
      const courriel = buildIdentityOutcomeEmail(locale, issue);

      await this.emailSender
        .send({
          to: email,
          subject: courriel.subject,
          text: courriel.text,
          html: courriel.html,
        })
        .catch((erreur: unknown) => {
          this.logger.warn(`Courriel d'identite non envoye a ${email} : ${erreur}`);
        });
    }
  }
}
