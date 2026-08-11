import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import {
  CHAT_REPOSITORY,
  EXCHANGE_REPOSITORY,
} from 'src/interfaces/http/tokens/token';
import { ExchangeRepository } from 'src/domain/auth/repositories/exchange.repository';
import { mapMessage } from '../message.mapper';
import { MyChatListItem } from '@wim/shared';

@Injectable()
export class GetMyChatsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(EXCHANGE_REPOSITORY)
    private readonly exchangeRepository: ExchangeRepository,
  ) {}

  async execute(userId: string): Promise<MyChatListItem[]> {
    const chats = await this.chatRepository.findByUserId(userId);
    
    return Promise.all(
      chats.map(async chat => {
        const otherParticipant =
          chat.participants.find(
            participant =>
              participant.userId !== userId,
          );
        const lastMessage = chat.messages[0] ?? null;
        const unreadCount = await this.chatRepository.countUnreadMessages(
            chat.id,
            userId,
          );

        const pendingExchange = otherParticipant
          ? await this.exchangeRepository.findPendingBetween(
              userId,
              otherParticipant.userId,
            )
          : null;

        return {
          id: chat.id,
          matchId: chat.matchId,
          participant: otherParticipant
            ? {
                id: otherParticipant.user.id,
                firstName:
                  otherParticipant.user.firstName,
                lastName:
                  otherParticipant.user.lastName,
                avatarUrl:
                  otherParticipant.user.avatarUrl,
              }
            : {
                id: '',
                firstName: 'Utilisateur',
                lastName: '',
                avatarUrl: null,
              },
          lastMessage: lastMessage
            ? mapMessage(lastMessage)
            : null,

          unreadCount,
          isRequest: pendingExchange?.hostId === userId,
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString(),
        };
      }),
    );
  }
}