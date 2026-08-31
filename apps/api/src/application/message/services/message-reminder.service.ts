import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PushSenderService } from 'src/application/notification/push-sender.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const JOUR_MS = 24 * 60 * 60 * 1000;
const DELAI_MS = 2 * JOUR_MS;
const LOT_MAX = 200;

@Injectable()
export class MessageReminderService {
  private readonly logger = new Logger(MessageReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushSender: PushSenderService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async envoyerLesRappels(): Promise<void> {
    try {
      const envoyes = await this.appliquer();

      if (envoyes) {
        this.logger.log(`${envoyes} rappel(s) de message envoye(s).`);
      }
    } catch (error) {
      this.logger.warn(
        `Rappels de message impossibles : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async appliquer(): Promise<number> {
    const limite = new Date(Date.now() - DELAI_MS);

    const conversations = await this.prisma.chat.findMany({
      where: { messages: { some: { createdAt: { lt: limite } } } },
      take: LOT_MAX,
      select: {
        id: true,
        participants: {
          select: { id: true, userId: true, reminderSentAt: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            senderId: true,
            createdAt: true,
            content: true,
            sender: { select: { firstName: true } },
          },
        },
      },
    });

    let envoyes = 0;

    for (const conversation of conversations) {
      const dernier = conversation.messages[0];

      if (!dernier || dernier.createdAt >= limite) continue;

      // Le dernier mot appartient a l'autre : c'est celui qui n'a pas repondu
      // qu'on relance, et lui seul.
      const destinataire = conversation.participants.find(
        (participant) => participant.userId !== dernier.senderId,
      );

      if (!destinataire) continue;

      // Un rappel deja envoye depuis ce message serait le meme rappel.
      if (
        destinataire.reminderSentAt &&
        destinataire.reminderSentAt >= dernier.createdAt
      ) {
        continue;
      }

      const prenom = dernier.sender?.firstName?.trim();

      await this.pushSender
        .sendToUser(destinataire.userId, {
          title: 'Un message vous attend',
          body: prenom
            ? `${prenom} vous a écrit et attend votre réponse.`
            : 'Un message attend votre réponse.',
          data: { chatId: conversation.id },
        })
        .catch(() => undefined);

      await this.prisma.chatParticipant.update({
        where: { id: destinataire.id },
        data: { reminderSentAt: new Date() },
      });

      envoyes += 1;
    }

    return envoyes;
  }
}
