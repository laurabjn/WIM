import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const TAILLE_LOT = 100;

type Notification = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

@Injectable()
export class PushSenderService {
  private readonly logger = new Logger(PushSenderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerToken(
    userId: string,
    token: string,
    platform?: string,
  ): Promise<void> {
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });
  }

  async removeToken(token: string): Promise<void> {
    await this.prisma.pushToken.deleteMany({ where: { token } });
  }

  async sendToUser(
    userId: string,
    notification: Notification,
    options: { onlyIfMessagesEnabled?: boolean } = {},
  ): Promise<void> {
    const { onlyIfMessagesEnabled = true } = options;

    if (onlyIfMessagesEnabled) {
      const destinataire = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { notifyNewMessages: true },
      });

      if (destinataire?.notifyNewMessages === false) return;
    }

    const tokens = await this.prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    const messages = tokens.map((entry) => ({
      to: entry.token,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
    }));

    for (let debut = 0; debut < messages.length; debut += TAILLE_LOT) {
      const lot = messages.slice(debut, debut + TAILLE_LOT);

      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(lot),
        });

        if (!response.ok) {
          this.logger.warn(`Expo a repondu ${response.status} : envoi ignore.`);
          continue;
        }

        await this.nettoyerJetonsMorts(lot, await response.json());
      } catch (error) {
        this.logger.warn(
          `Notification non envoyee : ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private async nettoyerJetonsMorts(
    lot: { to: string }[],
    reponse: any,
  ): Promise<void> {
    const tickets = Array.isArray(reponse?.data) ? reponse.data : [];

    const morts = tickets
      .map((ticket: any, index: number) =>
        ticket?.details?.error === 'DeviceNotRegistered' ? lot[index]?.to : null,
      )
      .filter((token: string | null): token is string => Boolean(token));

    if (morts.length === 0) return;

    await this.prisma.pushToken.deleteMany({ where: { token: { in: morts } } });

    this.logger.log(`${morts.length} jeton(s) d'appareil disparu(s) retire(s).`);
  }
}
