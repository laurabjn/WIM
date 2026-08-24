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

    await this.prisma.message.delete({ where: { id: messageId } });

    return { chatId: message.chatId };
  }
}

@Injectable()
export class HideChatUseCase {
  constructor(private readonly prisma: PrismaService) {}

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

@Injectable()
export class SearchMessagesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    chatId: string,
    userId: string,
    query: string,
  ): Promise<ChatMessages[]> {
    const terme = query.trim();

    if (terme.length < 2) return [];

    const participant = await this.prisma.chatParticipant.findFirst({
      where: { chatId, userId },
      select: { id: true },
    });

    if (!participant) {
      throw new ForbiddenException("Cette conversation n'est pas la vôtre.");
    }

    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
        content: { contains: terme, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: AVEC_EXPEDITEUR,
    });

    return messages.map(mapMessage);
  }
}
