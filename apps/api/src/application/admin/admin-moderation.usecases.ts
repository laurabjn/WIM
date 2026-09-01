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

@Injectable()
export class GetAdminStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [
      signalementsEnAttente,
      comptesSuspendus,
      utilisateurs,
      nouveauxUtilisateurs,
      logements,
      echangesEnCours,
      echangesEnAttente,
      messages,
    ] = await Promise.all([
      this.prisma.userReport.count({ where: { handledAt: null } }),
      this.prisma.user.count({ where: { suspendedAt: { not: null } } }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.home.count(),
      this.prisma.exchange.count({ where: { status: 'CURRENT' } }),
      this.prisma.exchange.count({ where: { status: 'PENDING' } }),
      this.prisma.message.count(),
    ]);

    return {
      signalementsEnAttente,
      comptesSuspendus,
      utilisateurs,
      nouveauxUtilisateurs,
      logements,
      echangesEnCours,
      echangesEnAttente,
      messages,
    };
  }
}

@Injectable()
export class GetAccountFileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const compte = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        lastSeenAt: true,
        suspendedAt: true,
        identityStatus: true,
        _count: {
          select: {
            homes: true,
            messages: true,
            reviews: true,
            reportsMade: true,
            reportsReceived: true,
          },
        },
      },
    });

    if (!compte) throw new NotFoundException('Compte introuvable');

    const signalements = await this.prisma.userReport.findMany({
      where: { reportedId: userId },
      orderBy: [{ handledAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        reporter: RESUME_UTILISATEUR,
        review: {
          select: { id: true, score: true, comment: true, createdAt: true },
        },
      },
    });

    const logements = await this.prisma.home.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        city: true,
        country: true,
        isAvailableForExchange: true,
        photos: { select: { url: true }, orderBy: { position: 'asc' }, take: 1 },
      },
    });

    const auteursDistincts = new Set(
      signalements.map((signalement) => signalement.reporterId),
    );

    return {
      compte: {
        id: compte.id,
        email: compte.email,
        firstName: compte.firstName,
        lastName: compte.lastName,
        avatarUrl: compte.avatarUrl,
        bio: compte.bio,
        createdAt: compte.createdAt.toISOString(),
        lastSeenAt: compte.lastSeenAt?.toISOString() ?? null,
        suspendedAt: compte.suspendedAt?.toISOString() ?? null,
        identityStatus: compte.identityStatus,
        logements: compte._count.homes,
        messages: compte._count.messages,
        avis: compte._count.reviews,
        signalementsEmis: compte._count.reportsMade,
        signalementsRecus: compte._count.reportsReceived,
        auteursDistincts: auteursDistincts.size,
      },
      signalements: signalements.map((signalement) => ({
        id: signalement.id,
        reason: signalement.reason,
        message: signalement.message,
        createdAt: signalement.createdAt.toISOString(),
        handledAt: signalement.handledAt?.toISOString() ?? null,
        reporter: signalement.reporter,
        review: signalement.review
          ? {
              id: signalement.review.id,
              score: signalement.review.score,
              comment: signalement.review.comment,
              createdAt: signalement.review.createdAt.toISOString(),
            }
          : null,
      })),
      logements: logements.map((logement) => ({
        id: logement.id,
        title: logement.title,
        city: logement.city,
        country: logement.country,
        ouvert: logement.isAvailableForExchange,
        photo: logement.photos[0]?.url ?? null,
      })),
    };
  }
}
