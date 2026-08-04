import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { MessageRepository } from 'src/domain/auth/repositories/message.repository';
import { CHAT_REPOSITORY, MESSAGE_REPOSITORY } from 'src/interfaces/http/tokens/token';
import { mapMessage } from '../message.mapper';
import type { ChatMessages } from '@wim/shared';

type Input = {
  chatId: string;
  senderId: string;
  content: string;
};

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  // Renvoie le contrat partagé avec les clients (dates ISO), pas le type du
  // domaine (dates `Date`) : c'est `mapMessage` qui fait la conversion.
  async execute({
    chatId,
    senderId,
    content,
  }: Input): Promise<ChatMessages> {
    const cleanedContent =
      content.trim();

    if (!cleanedContent) {
      throw new BadRequestException(
        'Le message ne peut pas être vide.',
      );
    }

    const chat = await this.chatRepository.findById(
      chatId,
    );

    if (!chat) {
      throw new NotFoundException(
        'Chat introuvable.',
      );
    }

    const participant = await this.chatRepository.findParticipant(
        chatId,
        senderId,
      );

    if (!participant) {
      throw new ForbiddenException(
        'Vous ne pouvez pas envoyer de message dans ce chat.',
      );
    }

    const message = await this.messageRepository.create({
        chatId,
        senderId,
        content: cleanedContent,
      });

    await this.chatRepository.touchChat(chatId);

    return mapMessage(message);
  }
}