import { Module } from '@nestjs/common';

import {
  GetAdminStatsUseCase,
  ListReportsUseCase,
  MarkReportHandledUseCase,
  SuspendUserUseCase,
} from 'src/application/admin/admin-moderation.usecases';
import { ReviewReminderService } from 'src/application/exchange/services/review-reminder.service';
import { StayLifecycleService } from 'src/application/exchange/services/stay-lifecycle.service';
import { RecommendationWeightsService } from 'src/application/swipe/services/recommendation-weights.service';
import { ConsoleEmailSender } from 'src/infrastructure/notifications/console-email.sender';
import {
  NodemailerEmailSender,
  isSmtpConfigured,
} from 'src/infrastructure/notifications/nodemailer-email.sender';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { EMAIL_SENDER } from '../tokens/token';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { AdminController } from '../controllers/admin.controller';

@Module({
  controllers: [AdminController],
  providers: [
    PrismaService,
    PushSenderService,
    ReviewReminderService,
    StayLifecycleService,
    RecommendationWeightsService,
    ConsoleEmailSender,
    NodemailerEmailSender,
    {
      provide: EMAIL_SENDER,
      useFactory: (
        nodemailer: NodemailerEmailSender,
        console_: ConsoleEmailSender,
      ) => (isSmtpConfigured() ? nodemailer : console_),
      inject: [NodemailerEmailSender, ConsoleEmailSender],
    },
    GetAdminStatsUseCase,
    ListReportsUseCase,
    MarkReportHandledUseCase,
    SuspendUserUseCase,
  ],
})
export class AdminModule {}
