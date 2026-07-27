import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { CHAT_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
  ) {}

  async execute(input: {
    chatId: string;
    senderId: string;
    content: string;
  }) {
    const content = input.content.trim();

    if (!content) {
      throw new BadRequestException(
        'Le message ne peut pas être vide',
      );
    }

    const isParticipant =
      await this.chatRepository.isParticipant(
        input.chatId,
        input.senderId,
      );

    if (!isParticipant) {
      throw new ForbiddenException(
        'Vous ne participez pas à cette conversation',
      );
    }

    return this.chatRepository.createMessage({
      chatId: input.chatId,
      senderId: input.senderId,
      content,
    });
  }
}