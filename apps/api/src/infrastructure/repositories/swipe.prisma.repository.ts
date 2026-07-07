import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { SwipeRepository, CreateSwipeInput } from 'src/domain/auth/repositories/swipe.repository';

@Injectable()
export class SwipePrismaRepository implements SwipeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSwipeInput): Promise<void> {
    await this.prisma.swipe.upsert({
      where: {
        swiperId_targetUserId: {
          swiperId: input.swiperId,
          targetUserId: input.targetUserId,
        },
      },
      update: {
        direction: input.direction,
      },
      create: input,
    });
  }

  async hasLike(fromUserId: string, toUserId: string): Promise<boolean> {
    const swipe = await this.prisma.swipe.findUnique({
      where: {
        swiperId_targetUserId: {
          swiperId: fromUserId,
          targetUserId: toUserId,
        },
      },
    });

    return swipe?.direction === 'LIKE';
  }

  async createMatch(userAId: string, userBId: string): Promise<{ id: string }> {
    const [user1Id, user2Id] = [userAId, userBId].sort();

    return this.prisma.match.upsert({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
      update: {},
      create: {
        user1Id,
        user2Id,
        status: 'PENDING',
      },
      select: {
        id: true,
      },
    });
  }
}