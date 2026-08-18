import { Injectable } from '@nestjs/common';
import {
  Chat,
  ChatListItem,
  ChatMessage,
  ChatParticipant,
  ChatRepository
} from 'src/domain/auth/repositories/chat.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';


@Injectable()
export class ChatPrismaRepository implements ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(
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

      select: {
        id: true,
        matchId: true,
        createdAt: true,
        updatedAt: true,

        participants: {
          select: {
            id: true,
            chatId: true,
            userId: true,
            lastReadMessageId: true,
            lastReadAt: true,
            joinedAt: true,

            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                statusText: true,
                statusUpdatedAt: true,
              },
            },
          },
        },

        messages: {
          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],

          take: 1,

          select: {
            id: true,
            chatId: true,
            senderId: true,
            content: true,
            type: true,
            attachmentUrl: true,
            attachmentDurationMs: true,
            createdAt: true,
            updatedAt: true,

            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findById(chatId: string): Promise<Chat | null> {
    return this.prisma.chat.findUnique({
      where: {
        id: chatId,
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
          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],
          take: 1,
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
        },
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

  async findParticipant(
    chatId: string,
    userId: string,
  ): Promise<ChatParticipant | null> {
    return this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
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
    });
  }

  async findMyChats(userId: string): Promise<ChatListItem[]> {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
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
          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],
          take: 1,
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
        },
      },
    });
  }

  async updateLastReadMessage(
    chatId: string,
    userId: string,
    lastReadMessageId: string | null,
  ): Promise<void> {
    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        lastReadMessageId,
      },
    });
  }

  async touchChat(chatId: string): Promise<void> {
    await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async countUnreadMessages(chatId: string, userId: string): Promise<number> {
    const participant =
      await this.prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId,
          },
        },
        select: {
          lastReadMessageId: true,
        },
      });

    if (!participant) {
      return 0;
    }

    let lastReadCreatedAt: Date | undefined;

    if (participant.lastReadMessageId) {
      const lastReadMessage =
        await this.prisma.message.findUnique({
          where: {
            id: participant.lastReadMessageId,
          },
          select: {
            createdAt: true,
          },
        });

      lastReadCreatedAt =
        lastReadMessage?.createdAt;
    }

    return this.prisma.message.count({
      where: {
        chatId,

        senderId: {
          not: userId,
        },

        ...(lastReadCreatedAt
          ? {
              createdAt: {
                gt: lastReadCreatedAt,
              },
            }
          : {}),
      },
    });
  }

  async countAllUnreadMessages(userId: string): Promise<number> {
    const participants =
      await this.prisma.chatParticipant.findMany({
        where: {
          userId,
        },
        select: {
          chatId: true,
          lastReadMessageId: true,
        },
      });

    const unreadCounts =
      await Promise.all(
        participants.map(async participant => {
          let lastReadCreatedAt:
            | Date
            | undefined;

          if (
            participant.lastReadMessageId
          ) {
            const lastReadMessage =
              await this.prisma.message.findUnique({
                where: {
                  id:
                    participant.lastReadMessageId,
                },
                select: {
                  createdAt: true,
                },
              });

            lastReadCreatedAt =
              lastReadMessage?.createdAt;
          }

          return this.prisma.message.count({
            where: {
              chatId: participant.chatId,

              senderId: {
                not: userId,
              },

              ...(lastReadCreatedAt
                ? {
                    createdAt: {
                      gt: lastReadCreatedAt,
                    },
                  }
                : {}),
            },
          });
        }),
      );

    return unreadCounts.reduce(
      (total, count) => total + count,
      0,
    );
  }

  createMessage(input: {
    chatId: string;
    senderId: string;
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'AUDIO';
    attachmentUrl?: string | null;
    attachmentDurationMs?: number | null;
  }): Promise<ChatMessage> {
    return this.prisma.message.create({
      data: {
        chatId: input.chatId,
        senderId: input.senderId,
        content: input.content,
        type: input.type ?? 'TEXT',
        attachmentUrl: input.attachmentUrl ?? null,
        attachmentDurationMs: input.attachmentDurationMs ?? null,
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

  async hasUserReplied(chatId: string, userId: string): Promise<boolean> {
    const message = await this.prisma.message.findFirst({
      where: { chatId, senderId: userId },
      select: { id: true },
    });

    return message !== null;
  }
}