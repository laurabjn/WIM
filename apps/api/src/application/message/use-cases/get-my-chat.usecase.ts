import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from 'src/interfaces/http/tokens/token';
import { mapMessage } from '../message.mapper';
import { MyChatListItem } from '@wim/shared';

@Injectable()
export class GetMyChatsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
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
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString(),
        };
      }),
    );
  }
}