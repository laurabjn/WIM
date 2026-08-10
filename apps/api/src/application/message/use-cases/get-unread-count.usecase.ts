import { Inject, Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from 'src/interfaces/http/tokens/token';
import { UnreadMessagesCount } from '@wim/shared';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
  ) {}

  async execute(userId: string): Promise<UnreadMessagesCount> {
    const count =
      await this.chatRepository.countAllUnreadMessages(userId);

    return { count };
  }
}
