import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class StayLifecycleService {
  private readonly logger = new Logger(StayLifecycleService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async appliquer(): Promise<{ commences: number; termines: number }> {
    const maintenant = new Date();

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
