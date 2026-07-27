import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class GetMyChatsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
  ) {}

  async execute(userId: string) {
    const chats =
      await this.chatRepository.findByUserId(
        userId,
      );

    return chats.map(chat => {
      const otherParticipant =
        chat.participants.find(
          participant =>
            participant.user.id !== userId,
        );

      return {
        id: chat.id,
        matchId: chat.matchId,
        user: otherParticipant?.user ?? null,
        lastMessage: chat.messages[0] ?? null,
        updatedAt: chat.updatedAt,
      };
    });
  }
}