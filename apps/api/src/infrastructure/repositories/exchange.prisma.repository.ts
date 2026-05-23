import { Injectable } from '@nestjs/common';
import type { Exchange } from '@wim/shared';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class ExchangeRepositoryPrisma {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string): Promise<Exchange[]> {
    const exchanges = await this.prisma.exchange.findMany({
      where: {
        OR: [{ hostId: userId }, { guestId: userId }],
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        home: {
          include: {
            photos: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return exchanges.map((exchange) => ({
      id: exchange.id,
      homeId: exchange.homeId,
      homeTitle: exchange.home.title,
      homeImageUrl: exchange.home.photos[0]?.url ?? null,
      location: `${exchange.home.city}, ${exchange.home.country}`,
      startDate: exchange.startDate.toISOString(),
      endDate: exchange.endDate.toISOString(),
      travelersCount: exchange.travelersCount,
      status: this.computeStatus(exchange.startDate, exchange.endDate),
    }));
  }

  private computeStatus(startDate: Date, endDate: Date): Exchange['status'] {
    const now = new Date();

    if (startDate <= now && endDate >= now) {
      return 'CURRENT';
    }

    if (startDate > now) {
      return 'FUTURE';
    }

    return 'PAST';
  }
}