import { Injectable } from '@nestjs/common';
import { ChatListItem, ChatMessage, ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';


@Injectable()
export class ChatPrismaRepository implements ChatRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findByUserId(
    userId: string,
  ): Promise<ChatListItem[]> {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },

      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },

        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  findMessages(
    chatId: string,
    userId: string,
  ): Promise<ChatMessage[]> {
    return this.prisma.message.findMany({
      where: {
        chatId,

        chat: {
          participants: {
            some: {
              userId,
            },
          },
        },
      },

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

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  createMessage(input: {
    chatId: string;
    senderId: string;
    content: string;
  }): Promise<ChatMessage> {
    return this.prisma.message.create({
      data: {
        chatId: input.chatId,
        senderId: input.senderId,
        content: input.content,
      },

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
  }

  async isParticipant(
    chatId: string,
    userId: string,
  ): Promise<boolean> {
    const participant =
      await this.prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId,
          },
        },
        select: {
          id: true,
        },
      });

    return Boolean(participant);
  }
}