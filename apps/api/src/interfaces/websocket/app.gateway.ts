import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type {
  ChatMessages,
  ChatUpdatedSocketPayload,
  MessageCreatedSocketPayload,
  MessagesReadSocketPayload,
  UnreadCountUpdatedSocketPayload,
} from '@wim/shared';

import { ChatRepository } from 'src/domain/auth/repositories/chat.repository';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import {
  CHAT_REPOSITORY,
  USER_REPOSITORY,
} from 'src/interfaces/http/tokens/token';

const wsCorsOrigin = process.env.WS_CORS_ORIGIN
  ? process.env.WS_CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : 'http://localhost:3001';

type AuthenticatedSocket = Socket & { userId?: string };

function chatRoom(chatId: string): string {
  return `chat:${chatId}`;
}

function userRoom(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({
  namespace: process.env.WS_NAMESPACE || '/ws',
  cors: {
    origin: wsCorsOrigin,
    credentials: true,
  },
})
export class AppGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  private readonly logger = new Logger(AppGateway.name);

  private readonly onlineUsers = new Map<string, number>();

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    const token =
      client.handshake.auth?.token ??
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      });

      client.userId = payload.sub;
      client.data.userId = payload.sub;
      await client.join(userRoom(payload.sub));
      this.markOnline(payload.sub);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) void this.markOffline(client.userId);
  }

  private markOnline(userId: string) {
    const next = (this.onlineUsers.get(userId) ?? 0) + 1;

    this.onlineUsers.set(userId, next);

    if (next === 1) this.server.emit('presence:changed', { userId, isOnline: true });
  }

  private async markOffline(userId: string) {
    const next = (this.onlineUsers.get(userId) ?? 1) - 1;

    if (next <= 0) {
      this.onlineUsers.delete(userId);

      const lastSeenAt = new Date().toISOString();

      // Une base indisponible ne doit pas empecher l'annonce du depart : le
      // statut compte plus que l'horodatage.
      try {
        await this.userRepository.touchLastSeen(userId);
      } catch (error) {
        this.logger.warn(
          `Derniere presence non enregistree pour ${userId} : ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      this.server.emit('presence:changed', {
        userId,
        isOnline: false,
        lastSeenAt,
      });

      return;
    }

    this.onlineUsers.set(userId, next);
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Quelqu'un qui a la conversation sous les yeux n'a pas besoin d'etre
   * notifie : le message arrive deja devant lui.
   */
  async isViewingChat(userId: string, chatId: string): Promise<boolean> {
    const sockets = await this.server.in(chatRoom(chatId)).fetchSockets();

    return sockets.some((socket) => socket.data?.userId === userId);
  }

  @SubscribeMessage('presence:list')
  async listPresence(@MessageBody() body: { userIds?: string[] }) {
    const userIds = body?.userIds ?? [];

    if (userIds.length === 0) return [];

    const absents = userIds.filter((userId) => !this.onlineUsers.has(userId));

    let dernieres: Record<string, string | null> = {};

    try {
      dernieres = await this.userRepository.findLastSeen(absents);
    } catch (error) {
      this.logger.warn(
        `Dernieres presences illisibles : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return userIds.map((userId) => ({
      userId,
      isOnline: this.onlineUsers.has(userId),
      lastSeenAt: dernieres[userId] ?? null,
    }));
  }

  // La frappe ne laisse aucune trace : elle ne vaut que pour les sockets
  // presents dans le salon, et le client la laisse expirer d'elle-meme.
  @SubscribeMessage('typing')
  typing(
    @MessageBody() body: { chatId?: string; isTyping?: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!body?.chatId || !client.userId) return { sent: false };

    if (!client.rooms.has(chatRoom(body.chatId))) return { sent: false };

    client.to(chatRoom(body.chatId)).emit('typing:changed', {
      chatId: body.chatId,
      userId: client.userId,
      isTyping: Boolean(body.isTyping),
    });

    return { sent: true };
  }

  @SubscribeMessage('chat:join')
  async joinChat(
    @MessageBody() body: { chatId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const chatId = body?.chatId;

    if (!chatId || !client.userId) {
      return { joined: false };
    }

    const isParticipant = await this.chatRepository.isParticipant(
      chatId,
      client.userId,
    );

    if (!isParticipant) {
      return { joined: false };
    }

    await client.join(chatRoom(chatId));

    return { joined: true };
  }

  @SubscribeMessage('chat:leave')
  async leaveChat(
    @MessageBody() body: { chatId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (body?.chatId) {
      await client.leave(chatRoom(body.chatId));
    }

    return { left: true };
  }

  emitMessageCreated(chatId: string, message: ChatMessages) {
    const payload: MessageCreatedSocketPayload = { chatId, message };

    this.server.to(chatRoom(chatId)).emit('message:created', payload);
  }

  emitMessagesRead(payload: MessagesReadSocketPayload) {
    this.server.to(chatRoom(payload.chatId)).emit('messages:read', payload);
  }

  emitChatUpdated(userId: string, payload: ChatUpdatedSocketPayload) {
    this.server.to(userRoom(userId)).emit('chat:updated', payload);
  }

  emitUnreadCount(userId: string, count: number) {
    const payload: UnreadCountUpdatedSocketPayload = { count };

    this.server.to(userRoom(userId)).emit('unread:updated', payload);
  }
}
