import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  GetAdminStatsUseCase,
  ListReportsUseCase,
  MarkReportHandledUseCase,
  SuspendUserUseCase,
} from 'src/application/admin/admin-moderation.usecases';
import { ReviewReminderService } from 'src/application/exchange/services/review-reminder.service';
import { StayLifecycleService } from 'src/application/exchange/services/stay-lifecycle.service';
import { GetAdminAnalyticsUseCase } from 'src/application/admin/admin-analytics.usecase';
import { MessageReminderService } from 'src/application/message/services/message-reminder.service';
import { RecommendationWeightsService } from 'src/application/swipe/services/recommendation-weights.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { AdminGuard } from '../admin.guard';
import { JwtAuthGuard } from '../jwt-auth.guard';

type AuthenticatedRequest = { user?: { sub?: string } };

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly stats: GetAdminStatsUseCase,
    private readonly listReports: ListReportsUseCase,
    private readonly markHandled: MarkReportHandledUseCase,
    private readonly suspendUser: SuspendUserUseCase,
    private readonly reviewReminders: ReviewReminderService,
    private readonly stayLifecycle: StayLifecycleService,
    private readonly weights: RecommendationWeightsService,
    private readonly messageReminders: MessageReminderService,
    private readonly analytics: GetAdminAnalyticsUseCase,
    private readonly prisma: PrismaService,
  ) {}

  // Un signalement designe un compte, mais l'administration doit aussi
  // pouvoir en chercher un qui n'a jamais ete signale.
  @Get('analytics')
  async analyses() {
    return this.analytics.execute();
  }

  @Get('users')
  async chercherDesComptes(@Query('q') recherche?: string) {
    const terme = recherche?.trim();

    const comptes = await this.prisma.user.findMany({
      where: terme
        ? {
            OR: [
              { email: { contains: terme, mode: 'insensitive' } },
              { firstName: { contains: terme, mode: 'insensitive' } },
              { lastName: { contains: terme, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isAdmin: true,
        suspendedAt: true,
        identityStatus: true,
        createdAt: true,
        _count: { select: { homes: true, reportsReceived: true } },
      },
    });

    return comptes.map((compte) => ({
      id: compte.id,
      email: compte.email,
      firstName: compte.firstName,
      lastName: compte.lastName,
      avatarUrl: compte.avatarUrl,
      isAdmin: compte.isAdmin,
      suspendedAt: compte.suspendedAt?.toISOString() ?? null,
      identityStatus: compte.identityStatus,
      createdAt: compte.createdAt.toISOString(),
      logements: compte._count.homes,
      signalements: compte._count.reportsReceived,
    }));
  }

  // Un prestataire de verification peut tomber, refuser a tort, ou n'etre pas
  // encore branche : l'administration doit pouvoir trancher a la main.
  @Patch('users/:userId/identity')
  async reglerLIdentite(
    @Param('userId') userId: string,
    @Body() body: { status?: string },
  ) {
    const autorises = ['NOT_VERIFIED', 'IN_PROGRESS', 'VERIFIED', 'REFUSED'];

    if (!body?.status || !autorises.includes(body.status)) {
      throw new BadRequestException("Statut de verification inconnu.");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { identityStatus: body.status as never },
    });

    return { identityStatus: body.status };
  }

  @Get('recommendation-weights')
  async ponderations() {
    return this.weights.valeurs();
  }

  @Patch('recommendation-weights')
  async reglerLesPonderations(@Body() body: Record<string, number>) {
    return this.weights.remplacer(body ?? {});
  }

  @Get('stats')
  async statistiques() {
    return this.stats.execute();
  }

  @Post('review-reminders/run')
  async lancerLesRappels() {
    const { commences, termines } = await this.stayLifecycle.appliquer();

    const envoyes = await this.reviewReminders.appliquer();

    const messages = await this.messageReminders.appliquer();

    return { commences, termines, envoyes, messages };
  }

  @Get('reports')
  async reports(@Query('pending') pending?: string) {
    return this.listReports.execute(pending === 'true');
  }

  @Post('reports/:reportId/handled')
  async handled(
    @Param('reportId') reportId: string,
    @Body() body: { handled?: boolean },
  ) {
    await this.markHandled.execute(reportId, body?.handled !== false);

    return { handled: body?.handled !== false };
  }

  @Post('users/:userId/suspension')
  async suspension(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() body: { suspended?: boolean },
  ) {
    await this.suspendUser.execute(
      userId,
      request.user?.sub ?? '',
      body?.suspended !== false,
    );

    return { suspended: body?.suspended !== false };
  }
}
