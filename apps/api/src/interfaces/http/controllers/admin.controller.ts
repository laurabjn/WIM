import {
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
import { RecommendationWeightsService } from 'src/application/swipe/services/recommendation-weights.service';
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
  ) {}

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

    return { commences, termines, envoyes };
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
