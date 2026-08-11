import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class BlockUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new BadRequestException('Vous ne pouvez pas vous bloquer.');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    await this.prisma.blockedUser.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });
  }
}

@Injectable()
export class UnblockUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(blockerId: string, blockedId: string): Promise<void> {
    await this.prisma.blockedUser.deleteMany({
      where: { blockerId, blockedId },
    });
  }
}

@Injectable()
export class ReportUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    reporterId: string,
    reportedId: string,
    reason: string,
    message?: string,
  ): Promise<{ id: string }> {
    if (reporterId === reportedId) {
      throw new BadRequestException('Vous ne pouvez pas vous signaler.');
    }

    if (!reason?.trim()) {
      throw new BadRequestException('Un motif est requis.');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: reportedId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const report = await this.prisma.userReport.create({
      data: {
        reporterId,
        reportedId,
        reason: reason.trim(),
        message: message?.trim() || null,
      },
      select: { id: true },
    });

    return report;
  }
}

@Injectable()
export class ListBlockedUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<string[]> {
    const blocked = await this.prisma.blockedUser.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });

    return blocked.map((entry) => entry.blockedId);
  }
}
