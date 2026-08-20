import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

/**
 * Fait avancer les sejours dans le temps.
 *
 * Jusqu'ici aucun echange ne changeait de statut tout seul : ils restaient
 * figes sur ce qu'on leur avait ecrit. Un sejour termine n'existait donc pas,
 * et rien ne pouvait declencher de notation.
 */
@Injectable()
export class StayLifecycleService {
  private readonly logger = new Logger(StayLifecycleService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Toutes les heures : un sejour se compte en jours, la minute n'a pas
  // d'importance, et une tache horaire reste peu couteuse.
  @Cron(CronExpression.EVERY_HOUR)
  async avancerLesSejours(): Promise<void> {
    try {
      const { commences, termines } = await this.appliquer();

      if (commences || termines) {
        this.logger.log(
          `Sejours : ${commences} commence(s), ${termines} termine(s).`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Avancement des sejours impossible : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Separee de la tache planifiee pour rester appelable a la main, notamment
   * au demarrage et dans les tests.
   */
  async appliquer(): Promise<{ commences: number; termines: number }> {
    const maintenant = new Date();

    // Termine d'abord : un sejour tres court pourrait commencer et finir dans
    // le meme passage, et l'ordre inverse le laisserait en cours.
    const termines = await this.prisma.exchange.updateMany({
      where: { status: { in: ['FUTURE', 'CURRENT'] }, endDate: { lt: maintenant } },
      data: { status: 'PAST' },
    });

    const commences = await this.prisma.exchange.updateMany({
      where: {
        status: 'FUTURE',
        startDate: { lte: maintenant },
        endDate: { gte: maintenant },
      },
      data: { status: 'CURRENT' },
    });

    return { commences: commences.count, termines: termines.count };
  }
}
