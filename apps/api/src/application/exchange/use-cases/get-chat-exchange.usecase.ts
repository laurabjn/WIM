import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PendingExchange } from '@wim/shared';

import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { ExchangeRepository } from 'src/domain/auth/repositories/exchange.repository';
import {
  CHAT_REPOSITORY,
  EXCHANGE_REPOSITORY,
} from 'src/interfaces/http/tokens/token';

@Injectable()
export class GetChatExchangeUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(EXCHANGE_REPOSITORY)
    private readonly exchangeRepository: ExchangeRepository,
  ) {}

  async execute(
    chatId: string,
    userId: string,
  ): Promise<PendingExchange | null> {
    const chat = await this.chatRepository.findById(chatId);

    if (!chat) {
      throw new NotFoundException('Chat introuvable.');
    }

    const participant = await this.chatRepository.findParticipant(
      chatId,
      userId,
    );

    if (!participant) {
      throw new ForbiddenException('Vous ne pouvez pas accéder à ce chat.');
    }

    const other = chat.participants.find(
      (member) => member.userId !== userId,
    );

    if (!other) {
      return null;
    }

    return this.exchangeRepository.findActiveBetween(userId, other.userId);
  }
}
