import { Module } from '@nestjs/common';
import { WebsocketModule } from 'src/interfaces/websocket/websocket.module';
import { ModerationModule } from './moderation.module';
import { GetChatMessagesUseCase } from 'src/application/message/use-cases/get-chat-messages.usecase';
import { GetMyChatsUseCase } from 'src/application/message/use-cases/get-my-chat.usecase';
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
} from '../tokens/token';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Module({
  imports: [WebsocketModule, ModerationModule],
  controllers: [
    ChatController,
  ],
    providers: [
      PrismaService,
      GetMyChatsUseCase,
      GetChatMessagesUseCase,
      SendMessageUseCase,
      MarkChatAsReadUseCase,
      GetUnreadCountUseCase,
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