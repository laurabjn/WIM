import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  SwipeRepository,
  CreateSwipeInput,
  SwipeRecord,
  MatchRecord
} from 'src/domain/auth/repositories/swipe.repository';

@Injectable()
export class SwipePrismaRepository implements SwipeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSwipeInput): Promise<SwipeRecord> {
    return this.prisma.swipe.upsert({
      where: {
        swiperId_homeId: {
          swiperId: input.swiperId,
          homeId: input.homeId,
        },
      },
      update: {
        direction: input.direction,
        targetUserId: input.targetUserId,
      },
      create: input,
    });
  }

  async hasMatch(
    firstUserId: string,
    secondUserId: string,
  ): Promise<boolean> {
    const match = await this.prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: firstUserId, user2Id: secondUserId },
          { user1Id: secondUserId, user2Id: firstUserId },
        ],
      },
      select: { id: true },
    });

    return Boolean(match);
  }

  async likedHomeIds(
    swiperId: string,
    targetUserId: string,
  ): Promise<string[]> {
    const swipes = await this.prisma.swipe.findMany({
      where: { swiperId, targetUserId, direction: 'LIKE' },
      orderBy: { createdAt: 'asc' },
      select: { homeId: true },
    });

    return swipes.map((swipe) => swipe.homeId);
  }

  async hasLike(swiperId: string, targetUserId: string): Promise<boolean> {
    const swipe = await this.prisma.swipe.findFirst({
      where: { swiperId, targetUserId, direction: 'LIKE' },
      select: { id: true },
    });

    return Boolean(swipe);
  }

  async hasOpenConversation(
    firstUserId: string,
    secondUserId: string,
  ): Promise<boolean> {
    // Une conversation entamee, pas une simple coquille : deux personnes qui se
    // parlent deja n'ont pas a se redecouvrir par un match.
    const chat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: firstUserId } } },
          { participants: { some: { userId: secondUserId } } },
          { messages: { some: {} } },
        ],
      },
      select: { id: true },
    });

    return chat !== null;
  }

  async createMatch(
    firstUserId: string,
    secondUserId: string,
  ) {
    const [user1Id, user2Id] = [
      firstUserId,
      secondUserId,
    ].sort();

    return this.prisma.$transaction(async prisma => {
      const match = await prisma.match.upsert({
        where: {
          user1Id_user2Id: {
            user1Id,
            user2Id,
          },
        },
        update: {
          status: 'ACCEPTED',
        },
        create: {
          user1Id,
          user2Id,
          status: 'ACCEPTED',
        },
      });

      const chat = await prisma.chat.upsert({
        where: {
          matchId: match.id,
        },
        update: {},
        create: {
          matchId: match.id,

          participants: {
            create: [
              {
                userId: user1Id,
              },
              {
                userId: user2Id,
              },
            ],
          },
        },
        include: {
          participants: true,
        },
      });

      return {
        ...match,
        chat,
      };
    });
  }

  async homeBelongsToUser(
    homeId: string,
    userId: string,
  ): Promise<boolean> {
    const home =
      await this.prisma.home.findFirst({
        where: {
          id: homeId,
          ownerId: userId,
        },

        select: {
          id: true,
        },
      });

    return Boolean(home);
  }
}