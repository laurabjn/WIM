import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { MessageRepository } from 'src/domain/auth/repositories/message.repository';
import { CHAT_REPOSITORY, MESSAGE_REPOSITORY } from 'src/interfaces/http/tokens/token';
import { mapMessage } from '../message.mapper';
import { ChatMessagesPage } from '@wim/shared';
import { MessageTranslationService } from '../services/message-translation.service';

type Input = {
  chatId: string;
  userId: string;
  cursor?: string;
  limit?: number;
  translate?: boolean;
};

@Injectable()
export class GetChatMessagesUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    private readonly translation: MessageTranslationService,
  ) {}

  async execute({
    chatId,
    userId,
    cursor,
    limit = 30,
    translate = false,
  }: Input): Promise<ChatMessagesPage> {
    const chat = await this.chatRepository.findById(chatId);

    if (!chat) {
      throw new NotFoundException(
        'Chat introuvable.',
      );
    }

    const participant =
      await this.chatRepository.findParticipant(
        chatId,
        userId,
      );

    if (!participant) {
      throw new ForbiddenException(
        'Vous ne pouvez pas accéder à ce chat.',
      );
    }

    const result = await this.messageRepository.findChatMessages(
        {
          chatId,
          cursor,
          limit,
        },
      );

    const messages = result.messages.map(mapMessage);

    return {
      messages: translate
        ? await this.translation.translate(messages, userId)
        : messages,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    };
  }
}