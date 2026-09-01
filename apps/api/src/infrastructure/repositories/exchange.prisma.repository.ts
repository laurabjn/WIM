import { Injectable } from '@nestjs/common';
import type { Exchange, PendingExchange } from '@wim/shared';
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
        guestHome: {
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

    const partnerIds = exchanges.map((exchange) =>
      exchange.hostId === userId ? exchange.guestId : exchange.hostId,
    );

    const partners = await this.prisma.user.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
    });

    const partnerById = new Map(partners.map((p) => [p.id, p]));

    const chats = await this.prisma.chat.findMany({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: { in: partnerIds } } } },
        ],
      },
      select: {
        id: true,
        participants: { select: { userId: true } },
      },
    });

    const chatByPartnerId = new Map<string, string>();

    for (const chat of chats) {
      const other = chat.participants.find((p) => p.userId !== userId);

      if (other) chatByPartnerId.set(other.userId, chat.id);
    }

    return exchanges.map((exchange) => ({
      id: exchange.id,
      homeId: exchange.homeId,
      homeTitle: exchange.home.title,
      homeImageUrl: exchange.home.photos[0]?.url ?? null,
      location: `${exchange.home.city}, ${exchange.home.country}`,
      startDate: exchange.startDate.toISOString(),
      endDate: exchange.endDate.toISOString(),
      travelersCount: exchange.travelersCount,
      status: this.computeStatus(
        exchange.status,
        exchange.startDate,
        exchange.endDate,
      ),
      partner:
        partnerById.get(
          exchange.hostId === userId ? exchange.guestId : exchange.hostId,
        ) ?? null,
      isHost: exchange.hostId === userId,
      chatId:
        chatByPartnerId.get(
          exchange.hostId === userId ? exchange.guestId : exchange.hostId,
        ) ?? null,
      guestHomeId: exchange.guestHomeId ?? null,
      guestHomeTitle: exchange.guestHome?.title ?? null,
      guestHomeImageUrl: exchange.guestHome?.photos?.[0]?.url ?? null,
    }));
  }

  private computeStatus(
    stored: Exchange['status'],
    startDate: Date,
    endDate: Date,
  ): Exchange['status'] {
    if (stored === 'PENDING' || stored === 'DECLINED') {
      return stored;
    }

    const now = new Date();

    if (startDate <= now && endDate >= now) {
      return 'CURRENT';
    }

    if (startDate > now) {
      return 'FUTURE';
    }

    return 'PAST';
  }

  private readonly pendingInclude = {
    home: {
      include: {
        photos: { orderBy: { position: 'asc' }, take: 1 },
      },
    },
    guestHome: {
      include: {
        photos: { orderBy: { position: 'asc' }, take: 1 },
      },
    },
  } as const;

  private mapPending(exchange: any, viewerId?: string): PendingExchange {
    return {
      id: exchange.id,
      homeId: exchange.homeId,
      homeTitle: exchange.home.title,
      homeImageUrl: exchange.home.photos[0]?.url ?? null,
      location: `${exchange.home.city}, ${exchange.home.country}`,
      startDate: exchange.startDate.toISOString(),
      endDate: exchange.endDate.toISOString(),
      travelersCount: exchange.travelersCount,
      status: exchange.status,
      hostId: exchange.hostId,
      guestId: exchange.guestId,
      isHost: viewerId ? exchange.hostId === viewerId : false,
      guestHomeId: exchange.guestHomeId ?? null,
      guestHomeTitle: exchange.guestHome?.title ?? null,
      guestHomeImageUrl: exchange.guestHome?.photos?.[0]?.url ?? null,
    };
  }

  async findActiveBetween(
    firstUserId: string,
    secondUserId: string,
  ): Promise<PendingExchange | null> {
    const exchange = await this.prisma.exchange.findFirst({
      where: {
        status: { in: ['PENDING', 'FUTURE', 'CURRENT'] },
        OR: [
          { hostId: firstUserId, guestId: secondUserId },
          { hostId: secondUserId, guestId: firstUserId },
        ],
      },
      include: this.pendingInclude,
      orderBy: { createdAt: 'desc' },
    });

    return exchange ? this.mapPending(exchange, firstUserId) : null;
  }

  async findById(
    exchangeId: string,
    viewerId?: string,
  ): Promise<PendingExchange | null> {
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: this.pendingInclude,
    });

    return exchange ? this.mapPending(exchange, viewerId) : null;
  }

  async updateStatus(
    exchangeId: string,
    status: string,
    viewerId?: string,
    guestHomeId?: string | null,
  ): Promise<PendingExchange> {
    const exchange = await this.prisma.exchange.update({
      where: { id: exchangeId },
      data: {
        status: status as any,
        ...(guestHomeId === undefined ? {} : { guestHomeId }),
      },
      include: this.pendingInclude,
    });

    return this.mapPending(exchange, viewerId);
  }

  async findGuestHomes(
    exchangeId: string,
  ): Promise<{ id: string; title: string; imageUrl: string | null }[]> {
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
      select: { guestId: true },
    });

    if (!exchange) return [];

    const homes = await this.prisma.home.findMany({
      where: { ownerId: exchange.guestId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        photos: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { url: true },
        },
      },
    });

    return homes.map((home) => ({
      id: home.id,
      title: home.title,
      imageUrl: home.photos[0]?.url ?? null,
    }));
  }

  async updateDates(
    exchangeId: string,
    startDate: Date,
    endDate: Date,
    viewerId?: string,
  ): Promise<PendingExchange> {
    const exchange = await this.prisma.exchange.update({
      where: { id: exchangeId },
      data: { startDate, endDate },
      include: this.pendingInclude,
    });

    return this.mapPending(exchange, viewerId);
  }
}