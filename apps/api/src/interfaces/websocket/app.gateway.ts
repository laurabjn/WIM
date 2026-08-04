import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

const wsCorsOrigin = process.env.WS_CORS_ORIGIN
  ? process.env.WS_CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : 'http://localhost:3001';

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

  constructor(private readonly config: ConfigService) {}

  private readonly logger = new Logger(AppGateway.name);

  afterInit() {
    this.logger.log('WebSocket gateway initialized on namespace /ws');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  ping(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
    client.emit('pong', { ok: true, received: payload ?? null });
    return { ok: true };
  }
}
