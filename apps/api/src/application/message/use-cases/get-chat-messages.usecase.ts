import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class GetChatMessagesUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
  ) {}

  execute(
    chatId: string,
    userId: string,
  ) {
    return this.chatRepository.findMessages(
      chatId,
      userId,
    );
  }
}