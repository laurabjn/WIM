import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class HomeRatingService {
  private readonly logger = new Logger(HomeRatingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recalculer(homeId: string): Promise<void> {
    const resultat = await this.prisma.review.aggregate({
      where: { homeId },
      _avg: { score: true },
      _count: { _all: true },
    });

    await this.prisma.home.updateMany({
      where: { id: homeId },
      data: {
        averageRating:
          resultat._avg.score !== null
            ? Math.round(resultat._avg.score * 10) / 10
            : null,
        reviewsCount: resultat._count._all,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async reconcilierLesMoyennes(): Promise<void> {
    try {
      const corriges = await this.reconcilier();

      if (corriges) {
        this.logger.log(`${corriges} moyenne(s) de logement corrigee(s).`);
      }
    } catch (error) {
      this.logger.warn(
        `Reconciliation des moyennes impossible : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async reconcilier(): Promise<number> {
    const reels = await this.prisma.review.groupBy({
      by: ['homeId'],
      _avg: { score: true },
      _count: { _all: true },
    });

    const parLogement = new Map(
      reels.map((ligne) => [
        ligne.homeId,
        {
          moyenne:
            ligne._avg.score !== null
              ? Math.round(ligne._avg.score * 10) / 10
              : null,
          compte: ligne._count._all,
        },
      ]),
    );

    const logements = await this.prisma.home.findMany({
      select: { id: true, averageRating: true, reviewsCount: true },
    });

    let corriges = 0;

    for (const logement of logements) {
      const attendu = parLogement.get(logement.id) ?? {
        moyenne: null,
        compte: 0,
      };

      const memeMoyenne =
        (logement.averageRating ?? null) === attendu.moyenne ||
        (logement.averageRating === 0 && attendu.moyenne === null);

      if (memeMoyenne && logement.reviewsCount === attendu.compte) continue;

      await this.prisma.home.update({
        where: { id: logement.id },
        data: {
          averageRating: attendu.moyenne,
          reviewsCount: attendu.compte,
        },
      });

      corriges += 1;
    }

    return corriges;
  }
}
