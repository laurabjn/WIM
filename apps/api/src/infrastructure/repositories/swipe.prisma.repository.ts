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
        swiperId_targetUserId: {
          swiperId: input.swiperId,
          targetUserId: input.targetUserId,
        },
      },
      update: {
        direction: input.direction,
        homeId: input.homeId,
      },
      create: input,
    });
  }

  async hasLike(swiperId: string, targetUserId: string): Promise<boolean> {
    const swipe = await this.prisma.swipe.findUnique({
      where: {
        swiperId_targetUserId: {
          swiperId: swiperId,
          targetUserId: targetUserId,
        },
      },
    });

    return swipe?.direction === 'LIKE';
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