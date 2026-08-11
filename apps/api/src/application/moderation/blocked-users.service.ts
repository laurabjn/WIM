import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class BlockedUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getHiddenUserIds(userId: string): Promise<string[]> {
    const relations = await this.prisma.blockedUser.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
      select: { blockerId: true, blockedId: true },
    });

    const hidden = new Set<string>();

    for (const relation of relations) {
      hidden.add(
        relation.blockerId === userId ? relation.blockedId : relation.blockerId,
      );
    }

    return [...hidden];
  }

  async isBlockedBetween(
    firstUserId: string,
    secondUserId: string,
  ): Promise<boolean> {
    const relation = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: firstUserId, blockedId: secondUserId },
          { blockerId: secondUserId, blockedId: firstUserId },
        ],
      },
      select: { id: true },
    });

    return relation !== null;
  }

  async assertNotBlocked(
    firstUserId: string,
    secondUserId: string,
  ): Promise<void> {
    if (await this.isBlockedBetween(firstUserId, secondUserId)) {
      throw new ForbiddenException(
        "Cette conversation n'est plus disponible.",
      );
    }
  }
}
