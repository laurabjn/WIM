import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const PAGE = 30;

export type NotificationVue = {
  id: string;
  category: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  lu: boolean;
  createdAt: string;
};

@Injectable()
export class NotificationCenterService {
  constructor(private readonly prisma: PrismaService) {}

  async lister(
    userId: string,
    curseur?: string,
  ): Promise<{ notifications: NotificationVue[]; curseurSuivant: string | null }> {
    const lignes = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PAGE + 1,
      ...(curseur ? { cursor: { id: curseur }, skip: 1 } : {}),
    });

    const page = lignes.slice(0, PAGE);

    return {
      notifications: page.map((ligne) => ({
        id: ligne.id,
        category: ligne.category,
        title: ligne.title,
        body: ligne.body,
        data: (ligne.data as Record<string, unknown>) ?? {},
        lu: ligne.readAt !== null,
        createdAt: ligne.createdAt.toISOString(),
      })),
      curseurSuivant: lignes.length > PAGE ? page[page.length - 1].id : null,
    };
  }

  async compterNonLues(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async marquerLue(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async toutMarquerLu(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
