import { Module } from '@nestjs/common';
import { GetChatMessagesUseCase } from 'src/application/message/use-cases/get-chat-messages.usecase';
import { GetMyChatsUseCase } from 'src/application/message/use-cases/get-my-chat.usecase';
import { SendMessageUseCase } from 'src/application/message/use-cases/send-message.usecase';
import { ChatPrismaRepository } from 'src/infrastructure/repositories/chat.prisma.repository';
import { ChatController } from '../controllers/chat.controller';
import { CHAT_REPOSITORY } from '../tokens/token';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [
    ChatController,
  ],
    providers: [
      PrismaService,
      GetMyChatsUseCase,
      GetChatMessagesUseCase,
      SendMessageUseCase,
      {
        provide: CHAT_REPOSITORY,
        useClass: ChatPrismaRepository,
      },
  ],
  exports: [
    CHAT_REPOSITORY,
  ],
})
export class ChatModule {}