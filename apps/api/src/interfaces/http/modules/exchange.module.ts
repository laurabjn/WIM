import { Module } from '@nestjs/common';
import { StayReminderService } from 'src/application/exchange/services/stay-reminder.service';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { HomeRatingService } from 'src/application/home/services/home-rating.service';
import { ReviewReminderService } from 'src/application/exchange/services/review-reminder.service';
import { NotificationModule } from './notification.module';
import { ConsoleEmailSender } from 'src/infrastructure/notifications/console-email.sender';
import {
  NodemailerEmailSender,
  isSmtpConfigured,
} from 'src/infrastructure/notifications/nodemailer-email.sender';
import { EMAIL_SENDER } from '../tokens/token';
import { ListMyExchangesUseCase } from 'src/application/exchange/use-cases/list-my-exchanges.usecase';
import {
  CancelExchangeUseCase,
  ListGuestHomesUseCase,
  RespondToExchangeUseCase,
  UpdateExchangeDatesUseCase,
} from 'src/application/exchange/use-cases/respond-to-exchange.usecase';
import { GetChatExchangeUseCase } from 'src/application/exchange/use-cases/get-chat-exchange.usecase';
import { RequestExchangeUseCase } from 'src/application/exchange/use-cases/request-exchange.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ExchangeController } from '../controllers/ExchangeController';
import { ExchangeRepositoryPrisma } from 'src/infrastructure/repositories/exchange.prisma.repository';
import { ChatPrismaRepository } from 'src/infrastructure/repositories/chat.prisma.repository';
import { CHAT_REPOSITORY, EXCHANGE_REPOSITORY } from '../tokens/token';
import { ModerationModule } from './moderation.module';
import { WebsocketModule } from 'src/interfaces/websocket/websocket.module';
import { StayLifecycleService } from 'src/application/exchange/services/stay-lifecycle.service';
import {
  ListStaysToReviewUseCase,
  ReviewStayUseCase,
} from 'src/application/exchange/use-cases/review-stay.usecase';

@Module({
  imports: [NotificationModule, ModerationModule, WebsocketModule],
  controllers: [ExchangeController],
  providers: [
    PrismaService,
    StayLifecycleService,
    StayReminderService,
    PushSenderService,
    HomeRatingService,
    ReviewReminderService,
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
    ListStaysToReviewUseCase,
    ReviewStayUseCase,
    ExchangeRepositoryPrisma,
    {
      provide: EXCHANGE_REPOSITORY,
      useExisting: ExchangeRepositoryPrisma,
    },
    {
      provide: CHAT_REPOSITORY,
      useClass: ChatPrismaRepository,
    },
    {
      provide: ListMyExchangesUseCase,
      useFactory: (repository: ExchangeRepositoryPrisma) =>
        new ListMyExchangesUseCase(repository),
      inject: [ExchangeRepositoryPrisma],
    },
    ListGuestHomesUseCase,
  RespondToExchangeUseCase,
    UpdateExchangeDatesUseCase,
    CancelExchangeUseCase,
    GetChatExchangeUseCase,
    RequestExchangeUseCase,
  ],
})
export class ExchangeModule {}
