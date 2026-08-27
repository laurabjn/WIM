import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const JOUR_MS = 24 * 60 * 60 * 1000;

export type AnalyseAdmin = {
  inscriptions: { septJours: number; trenteJours: number; total: number };
  activite: { actifsSeptJours: number; jamaisRevenus: number };
  verification: Record<string, number>;
  logements: { total: number; ouverts: number; sansPhoto: number };
  echanges: Record<string, number>;
  conversations: { total: number; sansReponse: number };
  villesRecherchees: { ville: string; recherches: number }[];
};

@Injectable()
export class GetAdminAnalyticsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<AnalyseAdmin> {
    const depuis = (jours: number) => new Date(Date.now() - jours * JOUR_MS);

    const [
      total,
      septJours,
      trenteJours,
      actifsSeptJours,
      jamaisRevenus,
      verification,
      logements,
      ouverts,
      sansPhoto,
      echanges,
      conversations,
      villes,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: depuis(7) } } }),
      this.prisma.user.count({ where: { createdAt: { gte: depuis(30) } } }),
      this.prisma.user.count({ where: { lastSeenAt: { gte: depuis(7) } } }),
      this.prisma.user.count({ where: { lastSeenAt: null } }),
      this.prisma.user.groupBy({
        by: ['identityStatus'],
        _count: { _all: true },
      }),
      this.prisma.home.count(),
      this.prisma.home.count({ where: { isAvailableForExchange: true } }),
      this.prisma.home.count({ where: { photos: { none: {} } } }),
      this.prisma.exchange.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.chat.count(),
      this.prisma.searchHistory.groupBy({
        by: ['city'],
        _count: { _all: true },
        orderBy: { _count: { city: 'desc' } },
        take: 5,
      }),
    ]);

    // Une conversation sans le moindre message n'a jamais commence : elle dit
    // qu'un match n'a rien produit, ce qui interesse autant que le reste.
    const sansReponse = await this.prisma.chat.count({
      where: { messages: { none: {} } },
    });

    return {
      inscriptions: { septJours, trenteJours, total },
      activite: { actifsSeptJours, jamaisRevenus },
      verification: Object.fromEntries(
        verification.map((ligne) => [
          ligne.identityStatus,
          ligne._count._all,
        ]),
      ),
      logements: { total: logements, ouverts, sansPhoto },
      echanges: Object.fromEntries(
        echanges.map((ligne) => [ligne.status, ligne._count._all]),
      ),
      conversations: { total: conversations, sansReponse },
      villesRecherchees: villes
        .filter((ligne) => Boolean(ligne.city))
        .map((ligne) => ({
          ville: ligne.city as string,
          recherches: ligne._count._all,
        })),
    };
  }
}
