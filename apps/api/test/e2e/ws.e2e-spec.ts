import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../src/app.module';

describe('WebSocket Gateway (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(0);

    const server = app.getHttpServer();
    const address = server.address();
    const port = typeof address === 'string' ? 3002 : address.port;

    baseUrl = `http://localhost:${port}/ws`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should respond pong to ping', async () => {
    const socket: Socket = io(baseUrl, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Timeout waiting for pong'));
      }, 3000);

      socket.on('connect', () => {
        socket.emit('ping', { test: true });
      });

      socket.on('pong', (data) => {
        try {
          expect(data.ok).toBe(true);
          expect(data.received).toEqual({ test: true });
          clearTimeout(timeout);
          socket.disconnect();
          resolve();
        } catch (e) {
          clearTimeout(timeout);
          socket.disconnect();
          reject(e);
        }
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(err);
      });
    });
  });
});
