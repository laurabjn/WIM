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
import { BlockedUsersService } from 'src/application/moderation/blocked-users.service';
import { isOffensive } from 'src/application/moderation/offensive-language';
import type { ChatMessages } from '@wim/shared';

type Input = {
  chatId: string;
  senderId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'AUDIO';
  attachmentUrl?: string | null;
  attachmentDurationMs?: number | null;
  replyToId?: string | null;
};

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    private readonly blockedUsers: BlockedUsersService,
  ) {}

  async execute({
    chatId,
    senderId,
    content,
    type = 'TEXT',
    attachmentUrl = null,
    attachmentDurationMs = null,
    replyToId = null,
  }: Input): Promise<ChatMessages> {
    const cleanedContent =
      content.trim();

    if (!cleanedContent && !attachmentUrl) {
      throw new BadRequestException(
        'Le message ne peut pas être vide.',
      );
    }

    // Seuls les messages ecrits sont filtres. Un vocal porte lui aussi sa
    // transcription, mais elle est faite par la reconnaissance de l'appareil :
    // refuser un enregistrement sur un mot peut-etre mal entendu obligerait a
    // tout refaire, sans moyen de corriger.
    if (type === 'TEXT' && isOffensive(cleanedContent)) {
      throw new BadRequestException(
        'Ce message contient des propos injurieux. Reformulez-le pour l’envoyer.',
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

    const other = chat.participants.find(
      (member) => member.userId !== senderId,
    );

    if (other) {
      await this.blockedUsers.assertNotBlocked(senderId, other.userId);
    }

    const message = await this.messageRepository.create({
        chatId,
        senderId,
        content: cleanedContent,
        type,
        attachmentUrl,
        attachmentDurationMs,
        replyToId,
      });

    await this.chatRepository.touchChat(chatId);

    return mapMessage(message);
  }
}