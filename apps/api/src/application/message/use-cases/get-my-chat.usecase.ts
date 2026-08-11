import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from 'src/interfaces/http/tokens/token';
import { mapMessage } from '../message.mapper';
import { MyChatListItem } from '@wim/shared';
import { BlockedUsersService } from 'src/application/moderation/blocked-users.service';

@Injectable()
export class GetMyChatsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    private readonly blockedUsers: BlockedUsersService,
  ) {}

  async execute(userId: string): Promise<MyChatListItem[]> {
    const chats = await this.chatRepository.findByUserId(userId);

    const hidden = new Set(
      await this.blockedUsers.getHiddenUserIds(userId),
    );

    const visibleChats = chats.filter((chat) =>
      chat.participants.every(
        (participant) =>
          participant.userId === userId || !hidden.has(participant.userId),
      ),
    );
    
    return Promise.all(
      visibleChats.map(async chat => {
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

        const hasReplied = await this.chatRepository.hasUserReplied(
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
          isRequest: !hasReplied,
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString(),
        };
      }),
    );
  }
}