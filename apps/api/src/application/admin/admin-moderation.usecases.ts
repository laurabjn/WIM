import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const RESUME_UTILISATEUR = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    avatarUrl: true,
    suspendedAt: true,
  },
};

@Injectable()
export class ListReportsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Les signalements non traites d'abord, les plus recents en tete : c'est
   * dans cet ordre qu'on les traite.
   */
  async execute(seulementEnAttente = false) {
    const reports = await this.prisma.userReport.findMany({
      where: seulementEnAttente ? { handledAt: null } : undefined,
      orderBy: [{ handledAt: 'asc' }, { createdAt: 'desc' }],
      take: 200,
      include: {
        reporter: RESUME_UTILISATEUR,
        reported: RESUME_UTILISATEUR,
      },
    });

    return reports.map((report) => ({
      id: report.id,
      reason: report.reason,
      message: report.message,
      createdAt: report.createdAt.toISOString(),
      handledAt: report.handledAt ? report.handledAt.toISOString() : null,
      reporter: report.reporter,
      reported: {
        ...report.reported,
        suspendedAt: report.reported.suspendedAt
          ? report.reported.suspendedAt.toISOString()
          : null,
      },
    }));
  }
}

@Injectable()
export class MarkReportHandledUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(reportId: string, traite: boolean): Promise<void> {
    const report = await this.prisma.userReport.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!report) throw new NotFoundException('Signalement introuvable.');

    await this.prisma.userReport.update({
      where: { id: reportId },
      data: { handledAt: traite ? new Date() : null },
    });
  }
}

@Injectable()
export class SuspendUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    administrateurId: string,
    suspendre: boolean,
  ): Promise<void> {
    if (userId === administrateurId) {
      throw new BadRequestException('Vous ne pouvez pas vous suspendre.');
    }

    const cible = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isAdmin: true },
    });

    if (!cible) throw new NotFoundException('Utilisateur introuvable.');

    // Un administrateur suspendu ne pourrait plus lever sa propre suspension,
    // ni personne d'autre s'il est seul.
    if (cible.isAdmin && suspendre) {
      throw new BadRequestException(
        'Un compte administrateur ne peut pas être suspendu.',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { suspendedAt: suspendre ? new Date() : null },
    });
  }
}
