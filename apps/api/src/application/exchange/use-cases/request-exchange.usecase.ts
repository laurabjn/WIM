import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { BlockedUsersService } from 'src/application/moderation/blocked-users.service';
import { mapMessage } from 'src/application/message/message.mapper';
import type { ChatMessages } from '@wim/shared';
import { ListStaysToReviewUseCase } from './review-stay.usecase';

export type RequestExchangeInput = {
  requesterId: string;
  homeId: string;
  message: string;
  startDate?: string;
  endDate?: string;
  travelersCount?: number;
};

export type RequestExchangeResult = {
  exchangeId: string;
  chatId: string;
  message: ChatMessages;
};

@Injectable()
export class RequestExchangeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockedUsers: BlockedUsersService,
    private readonly staysToReview: ListStaysToReviewUseCase,
  ) {}

  async execute(input: RequestExchangeInput): Promise<RequestExchangeResult> {
    const content = input.message?.trim();

    if (!content) {
      throw new BadRequestException('Le message ne peut pas être vide.');
    }

    const home = await this.prisma.home.findUnique({
      where: { id: input.homeId },
      select: { id: true, ownerId: true },
    });

    if (!home) {
      throw new NotFoundException('Logement introuvable.');
    }

    if (home.ownerId === input.requesterId) {
      throw new BadRequestException(
        'Vous ne pouvez pas demander un échange sur votre propre logement.',
      );
    }

    await this.blockedUsers.assertNotBlocked(input.requesterId, home.ownerId);

    const proprietaire = await this.prisma.user.findUnique({
      where: { id: home.ownerId },
      select: { allowMessages: true },
    });

    if (proprietaire?.allowMessages === false) {
      throw new BadRequestException(
        'Cette personne n’accepte pas les nouveaux messages.',
      );
    }

    const active = await this.prisma.exchange.findFirst({
      where: {
        status: { in: ['PENDING', 'CURRENT', 'FUTURE'] },
        OR: [
          { hostId: home.ownerId, guestId: input.requesterId },
          { hostId: input.requesterId, guestId: home.ownerId },
        ],
      },
      select: { id: true, status: true },
    });

    if (await this.staysToReview.hasPendingReview(input.requesterId)) {
      throw new BadRequestException(
        'Notez votre dernier séjour avant de demander un nouvel échange.',
      );
    }

    if (active) {
      throw new BadRequestException(
        active.status === 'PENDING'
          ? "Une demande d'échange est déjà en attente avec cette personne."
          : 'Un échange est déjà en cours avec cette personne.',
      );
    }

    const logementsAimesParLHote = await this.prisma.swipe.findMany({
      where: {
        swiperId: home.ownerId,
        targetUserId: input.requesterId,
        direction: 'LIKE',
      },
      select: { homeId: true },
    });

    const contrepartie =
      logementsAimesParLHote.length === 1
        ? logementsAimesParLHote[0].homeId
        : null;

    const startDate = input.startDate
      ? new Date(input.startDate)
      : defaultStart();

    const endDate = input.endDate ? new Date(input.endDate) : defaultEnd();

    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.chat.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: input.requesterId } } },
            { participants: { some: { userId: home.ownerId } } },
          ],
        },
        select: { id: true },
      });

      const chat =
        existing ??
        (await prisma.chat.create({
          data: {
            participants: {
              create: [
                { userId: input.requesterId },
                { userId: home.ownerId },
              ],
            },
          },
          select: { id: true },
        }));

      const exchange = await prisma.exchange.create({
        data: {
          homeId: home.id,
          hostId: home.ownerId,
          guestId: input.requesterId,
          startDate,
          endDate,
          guestHomeId: contrepartie,
          travelersCount: input.travelersCount ?? 1,
          status: 'PENDING',
        },
        select: { id: true },
      });

      const message = await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: input.requesterId,
          content,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      await prisma.chat.update({
        where: { id: chat.id },
        data: { updatedAt: new Date() },
      });

      return {
        exchangeId: exchange.id,
        chatId: chat.id,
        message: mapMessage(message),
      };
    });
  }
}

function defaultStart(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 14);
  return date;
}

function defaultEnd(): Date {
  const date = defaultStart();
  date.setUTCDate(date.getUTCDate() + 7);
  return date;
}
