import { Injectable } from '@nestjs/common';
import { CreateMessageData, FindMessagesOptions, FindMessagesResult, MessageRepository } from 'src/domain/auth/repositories/message.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { ChatMessage } from 'src/domain/auth/repositories/chat.repository';


// L'expediteur, et le message cite reduit a ce que la citation affiche.
const AVEC_EXPEDITEUR_ET_CITATION = {
  sender: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  replyTo: {
    select: {
      id: true,
      content: true,
      type: true,
      senderId: true,
      sender: { select: { firstName: true } },
    },
  },
};

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateMessageData): Promise<ChatMessage> {
    return this.prisma.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
        type: data.type ?? 'TEXT',
        attachmentUrl: data.attachmentUrl ?? null,
        attachmentDurationMs: data.attachmentDurationMs ?? null,
        replyToId: data.replyToId ?? null,
      },
      include: AVEC_EXPEDITEUR_ET_CITATION,
    });
  }

  async findById(messageId: string): Promise<ChatMessage | null> {
    return this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: AVEC_EXPEDITEUR_ET_CITATION,
    });
  }

  async findLastMessage(chatId: string): Promise<ChatMessage | null> {
    return this.prisma.message.findFirst({
      where: {
        chatId,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      include: AVEC_EXPEDITEUR_ET_CITATION,
    });
  }

  async findChatMessages({
    chatId,
    cursor,
    limit,
  }: FindMessagesOptions): Promise<FindMessagesResult> {
    const rows =
      await this.prisma.message.findMany({
        where: {
          chatId,
        },

        orderBy: [
          {
            createdAt: 'desc',
          },
          {
            id: 'desc',
          },
        ],

        take: limit + 1,

        ...(cursor
          ? {
              cursor: {
                id: cursor,
              },
              skip: 1,
            }
          : {}),

        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

    const hasMore = rows.length > limit;

    const messages = hasMore
      ? rows.slice(0, limit)
      : rows;

    const nextCursor = hasMore
      ? messages[messages.length - 1]?.id ??
        null
      : null;

    return {
      messages,
      hasMore,
      nextCursor,
    };
  }
}