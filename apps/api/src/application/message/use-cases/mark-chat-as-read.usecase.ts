import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { MessageRepository } from 'src/domain/auth/repositories/message.repository';
import { CHAT_REPOSITORY, MESSAGE_REPOSITORY } from 'src/interfaces/http/tokens/token';

export type MarkChatAsReadResult = {
  chatId: string;
  userId: string;
  lastReadMessageId: string | null;
  readAt: string;
};

@Injectable()
export class MarkChatAsReadUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(
    chatId: string,
    userId: string,
  ): Promise<MarkChatAsReadResult> {
    const chat =
      await this.chatRepository.findById(
        chatId,
      );

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

    const lastMessage =
      await this.messageRepository.findLastMessage(
        chatId,
      );

    await this.chatRepository.updateLastReadMessage(
      chatId,
      userId,
      lastMessage?.id ?? null,
    );

    return {
      chatId,
      userId,
      lastReadMessageId:
        lastMessage?.id ?? null,
      readAt: new Date().toISOString(),
    };
  }
}