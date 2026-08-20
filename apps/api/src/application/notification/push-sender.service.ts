import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Expo refuse les lots trop gros ; cent est la taille recommandee.
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
    // Le jeton suit l'appareil, pas le compte : se connecter avec un autre
    // compte sur le meme telephone doit le reattribuer, sans quoi les
    // notifications continueraient d'arriver a l'ancien.
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });
  }

  async removeToken(token: string): Promise<void> {
    await this.prisma.pushToken.deleteMany({ where: { token } });
  }

  /**
   * Envoie a tous les appareils d'une personne. L'echec n'est jamais remonte a
   * l'appelant : un message doit partir meme si la notification se perd.
   */
  async sendToUser(userId: string, notification: Notification): Promise<void> {
    const destinataire = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notifyNewMessages: true },
    });

    if (destinataire?.notifyNewMessages === false) return;

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

  /**
   * Un appareil desinstalle garde son jeton en base et fait echouer chaque
   * envoi. Expo le signale par `DeviceNotRegistered` : on le supprime alors.
   */
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
