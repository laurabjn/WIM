import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ChatMessages } from '@wim/shared';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { isOffensive } from 'src/application/moderation/offensive-language';
import { mapMessage } from '../message.mapper';

const AVEC_EXPEDITEUR = {
  sender: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
};

@Injectable()
export class EditMessageUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    messageId: string,
    userId: string,
    content: string,
  ): Promise<ChatMessages> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, type: true },
    });

    if (!message) throw new NotFoundException('Message introuvable.');

    if (message.senderId !== userId) {
      throw new ForbiddenException("Ce message n'est pas le vôtre.");
    }

    // Une photo ou un vocal n'a pas de texte a corriger ; seule la
    // transcription en porte un, et elle decrit ce qui a ete dit.
    if (message.type !== 'TEXT') {
      throw new BadRequestException('Seul un message écrit peut être modifié.');
    }

    const propre = content.trim();

    if (!propre) {
      throw new BadRequestException('Le message ne peut pas être vide.');
    }

    if (isOffensive(propre)) {
      throw new BadRequestException(
        'Ce message contient des propos injurieux. Reformulez-le pour l’envoyer.',
      );
    }

    const modifie = await this.prisma.message.update({
      where: { id: messageId },
      data: { content: propre, editedAt: new Date() },
      include: AVEC_EXPEDITEUR,
    });

    // Les traductions gardees en cache decrivent l'ancien texte : les laisser
    // afficherait une traduction sans rapport avec ce qu'on lit.
    await this.prisma.messageTranslation.deleteMany({ where: { messageId } });

    return mapMessage(modifie);
  }
}

@Injectable()
export class DeleteMessageUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(messageId: string, userId: string): Promise<{ chatId: string }> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, chatId: true },
    });

    if (!message) throw new NotFoundException('Message introuvable.');

    if (message.senderId !== userId) {
      throw new ForbiddenException("Ce message n'est pas le vôtre.");
    }

    // La marque de derniere lecture pointe peut-etre dessus : la relation la
    // remet a null d'elle-meme.
    await this.prisma.message.delete({ where: { id: messageId } });

    return { chatId: message.chatId };
  }
}

@Injectable()
export class HideChatUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retire la conversation de sa propre liste sans y toucher pour l'autre.
   * Elle revient si un message arrive apres cette date.
   */
  async execute(chatId: string, userId: string): Promise<void> {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { chatId, userId },
      select: { id: true },
    });

    if (!participant) {
      throw new ForbiddenException("Cette conversation n'est pas la vôtre.");
    }

    await this.prisma.chatParticipant.update({
      where: { id: participant.id },
      data: { hiddenAt: new Date() },
    });
  }
}
