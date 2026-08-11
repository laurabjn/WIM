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
    const matches = await this.prisma.match.findMany({
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

        chat: {
          select: {
            id: true,
            matchId: true,
            createdAt: true,
            updatedAt: true,

            participants: {
              select: {
                id: true,
                chatId: true,
                userId: true,
                joinedAt: true,
              },
            },

            _count: {
              select: { messages: true },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return matches.map((match) => ({
      ...match,
      chat: match.chat
        ? {
            id: match.chat.id,
            matchId: match.chat.matchId,
            createdAt: match.chat.createdAt,
            updatedAt: match.chat.updatedAt,
            participants: match.chat.participants,
            messagesCount: match.chat._count.messages,
          }
        : null,
    }));
  }
}