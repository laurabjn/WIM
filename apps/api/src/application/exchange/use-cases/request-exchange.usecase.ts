import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { BlockedUsersService } from 'src/application/moderation/blocked-users.service';

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
};

@Injectable()
export class RequestExchangeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockedUsers: BlockedUsersService,
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
          travelersCount: input.travelersCount ?? 1,
          status: 'PENDING',
        },
        select: { id: true },
      });

      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: input.requesterId,
          content,
        },
      });

      await prisma.chat.update({
        where: { id: chat.id },
        data: { updatedAt: new Date() },
      });

      return { exchangeId: exchange.id, chatId: chat.id };
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
