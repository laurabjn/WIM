import { Module } from '@nestjs/common';
import { WebsocketModule } from 'src/interfaces/websocket/websocket.module';
import { ModerationModule } from './moderation.module';
import { GetChatMessagesUseCase } from 'src/application/message/use-cases/get-chat-messages.usecase';
import { GetMyChatsUseCase } from 'src/application/message/use-cases/get-my-chat.usecase';
import { GetMyRequestsUseCase } from 'src/application/message/use-cases/get-my-requests.usecase';
import { HomeRecommendationScorer } from 'src/application/swipe/services/home-recommendation-scorer';
import { RecommendationWeightsService } from 'src/application/swipe/services/recommendation-weights.service';
import { UserRecommendationProfileBuilder } from 'src/application/swipe/services/user-recommendation-profile.builder';
import { SendMessageUseCase } from 'src/application/message/use-cases/send-message.usecase';
import { MarkChatAsReadUseCase } from 'src/application/message/use-cases/mark-chat-as-read.usecase';
import { GetUnreadCountUseCase } from 'src/application/message/use-cases/get-unread-count.usecase';
import { ChatPrismaRepository } from 'src/infrastructure/repositories/chat.prisma.repository';
import { ExchangeRepositoryPrisma } from 'src/infrastructure/repositories/exchange.prisma.repository';
import { PrismaMessageRepository } from 'src/infrastructure/repositories/message.prisma.repository';
import { ChatController } from '../controllers/chat.controller';
import {
  CHAT_REPOSITORY,
  EXCHANGE_REPOSITORY,
  MESSAGE_REPOSITORY,
  TRANSLATOR,
} from '../tokens/token';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { MessageTranslationService } from 'src/application/message/services/message-translation.service';
import { DeeplTranslator } from 'src/infrastructure/translation/deepl.translator';
import { MessageReminderService } from 'src/application/message/services/message-reminder.service';
import { NotificationModule } from './notification.module';
import {
  DeleteMessageUseCase,
  EditMessageUseCase,
  HideChatUseCase,
  SearchMessagesUseCase,
} from 'src/application/message/use-cases/edit-message.usecase';

@Module({
  imports: [NotificationModule, WebsocketModule, ModerationModule],
  controllers: [
    ChatController,
  ],
    providers: [
      PrismaService,
      GetMyChatsUseCase,
      GetMyRequestsUseCase,
      UserRecommendationProfileBuilder,
      HomeRecommendationScorer,
    RecommendationWeightsService,
      MessageReminderService,
      GetChatMessagesUseCase,
      SendMessageUseCase,
      MarkChatAsReadUseCase,
      GetUnreadCountUseCase,
      EditMessageUseCase,
      DeleteMessageUseCase,
      HideChatUseCase,
      SearchMessagesUseCase,
      MessageTranslationService,
      {
        provide: TRANSLATOR,
        useClass: DeeplTranslator,
      },
      {
        provide: CHAT_REPOSITORY,
        useClass: ChatPrismaRepository,
      },
      {
        provide: MESSAGE_REPOSITORY,
        useClass: PrismaMessageRepository,
      },
      {
        provide: EXCHANGE_REPOSITORY,
        useClass: ExchangeRepositoryPrisma,
      },
  ],
  exports: [
    CHAT_REPOSITORY,
    MESSAGE_REPOSITORY,
  ],
})
export class ChatModule {}