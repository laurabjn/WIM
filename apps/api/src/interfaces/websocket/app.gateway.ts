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
import { CHAT_REPOSITORY } from 'src/interfaces/http/tokens/token';

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
  ) {}

  private readonly logger = new Logger(AppGateway.name);

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
      await client.join(userRoom(payload.sub));
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
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
