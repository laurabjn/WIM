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
  series: {
    semaine: string;
    inscriptions: number;
    echanges: number;
    messages: number;
  }[];
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

    const sansReponse = await this.prisma.chat.count({
      where: { messages: { none: {} } },
    });

    const series = await this.series();

    return {
      series,
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

  private async series() {
    const compter = async (table: string, colonne: string) =>
      this.prisma.$queryRawUnsafe<{ semaine: Date; nombre: bigint }[]>(
        `SELECT date_trunc('week', "${colonne}") AS semaine, count(*) AS nombre
         FROM "${table}"
         WHERE "${colonne}" >= now() - interval '12 weeks'
         GROUP BY 1 ORDER BY 1`,
      );

    const [inscriptions, echanges, messages] = await Promise.all([
      compter('users', 'created_at'),
      compter('exchanges', 'created_at'),
      compter('Message', 'createdAt'),
    ]);

    const semaines = new Map<
      string,
      { semaine: string; inscriptions: number; echanges: number; messages: number }
    >();

    const ajouter = (
      lignes: { semaine: Date; nombre: bigint }[],
      champ: 'inscriptions' | 'echanges' | 'messages',
    ) => {
      for (const ligne of lignes) {
        const cle = ligne.semaine.toISOString().slice(0, 10);

        const existante = semaines.get(cle) ?? {
          semaine: cle,
          inscriptions: 0,
          echanges: 0,
          messages: 0,
        };

        existante[champ] = Number(ligne.nombre);
        semaines.set(cle, existante);
      }
    };

    ajouter(inscriptions, 'inscriptions');
    ajouter(echanges, 'echanges');
    ajouter(messages, 'messages');

    return [...semaines.values()].sort((a, b) =>
      a.semaine.localeCompare(b.semaine),
    );
  }
}
