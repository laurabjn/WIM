import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PushSenderService } from 'src/application/notification/push-sender.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const JOUR_MS = 24 * 60 * 60 * 1000;
const AVANT_DEBUT_MS = 3 * JOUR_MS;
const AVANT_FIN_MS = JOUR_MS;
const LOT_MAX = 200;

@Injectable()
export class StayReminderService {
  private readonly logger = new Logger(StayReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushSender: PushSenderService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async envoyerLesRappels(): Promise<void> {
    try {
      const { debuts, fins } = await this.appliquer();

      if (debuts || fins) {
        this.logger.log(
          `Sejours : ${debuts} debut(s) annonce(s), ${fins} fin(s) annoncee(s).`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Rappels de sejour impossibles : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async appliquer(): Promise<{ debuts: number; fins: number }> {
    const debuts = await this.annoncerLesDebuts();
    const fins = await this.annoncerLesFins();

    return { debuts, fins };
  }

  private async annoncerLesDebuts(): Promise<number> {
    const maintenant = Date.now();

    const sejours = await this.prisma.exchange.findMany({
      where: {
        status: 'FUTURE',
        startReminderAt: null,
        startDate: {
          gt: new Date(maintenant),
          lte: new Date(maintenant + AVANT_DEBUT_MS),
        },
      },
      take: LOT_MAX,
      include: {
        home: { select: { title: true, city: true } },
        guestHome: { select: { title: true, city: true } },
      },
    });

    for (const sejour of sejours) {
      const jours = Math.max(
        1,
        Math.round((sejour.startDate.getTime() - maintenant) / JOUR_MS),
      );

      await this.prevenir(
        sejour.guestId,
        'Votre séjour approche',
        `Votre séjour à ${sejour.home.city} commence dans ${jours} jour(s).`,
        sejour.id,
      );

      if (sejour.guestHome) {
        await this.prevenir(
          sejour.hostId,
          'Votre séjour approche',
          `Votre séjour à ${sejour.guestHome.city} commence dans ${jours} jour(s).`,
          sejour.id,
        );
      } else {
        await this.prevenir(
          sejour.hostId,
          'Un séjour approche chez vous',
          `Votre invité arrive dans ${jours} jour(s).`,
          sejour.id,
        );
      }
    }

    if (sejours.length > 0) {
      await this.prisma.exchange.updateMany({
        where: { id: { in: sejours.map((sejour) => sejour.id) } },
        data: { startReminderAt: new Date() },
      });
    }

    return sejours.length;
  }

  private async annoncerLesFins(): Promise<number> {
    const maintenant = Date.now();

    const sejours = await this.prisma.exchange.findMany({
      where: {
        status: 'CURRENT',
        endReminderAt: null,
        endDate: {
          gt: new Date(maintenant),
          lte: new Date(maintenant + AVANT_FIN_MS),
        },
      },
      take: LOT_MAX,
    });

    for (const sejour of sejours) {
      for (const userId of [sejour.hostId, sejour.guestId]) {
        await this.prevenir(
          userId,
          'Votre séjour se termine bientôt',
          'Il se termine demain. Pensez à préparer votre départ et à noter votre séjour ensuite.',
          sejour.id,
        );
      }
    }

    if (sejours.length > 0) {
      await this.prisma.exchange.updateMany({
        where: { id: { in: sejours.map((sejour) => sejour.id) } },
        data: { endReminderAt: new Date() },
      });
    }

    return sejours.length;
  }

  private async prevenir(
    userId: string,
    title: string,
    body: string,
    exchangeId: string,
  ): Promise<void> {
    await this.pushSender
      .sendToUser(
        userId,
        { title, body, data: { exchangeId } },
        { categorie: 'exchanges' },
      )
      .catch(() => undefined);
  }
}
