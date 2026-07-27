import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../database/prisma/prisma.service';

import {
  MatchRepository,
  MatchWithUsersRecord,
} from 'src/domain/auth/repositories/match.repository';

@Injectable()
export class MatchPrismaRepository
  implements MatchRepository
{
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async findByUserId(
    userId: string,
  ): Promise<MatchWithUsersRecord[]> {
    return this.prisma.match.findMany({
      where: {
        OR: [
          {
            user1Id: userId,
          },
          {
            user2Id: userId,
          },
        ],

        status: {
          notIn: [
            'REJECTED',
            'BLOCKED',
          ],
        },
      },

      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            country: true,
          },
        },

        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            country: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}