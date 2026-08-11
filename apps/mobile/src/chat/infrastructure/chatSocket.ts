import { io, Socket } from 'socket.io-client';

import { API_URL } from '../../config/api';

const WS_NAMESPACE = process.env.EXPO_PUBLIC_WS_NAMESPACE ?? '/ws';

function socketUrl(): string {
  const base = API_URL.replace(/\/api\/?$/, '');

  return `${base}${WS_NAMESPACE}`;
}

let socket: Socket | null = null;

export function connectChatSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket?.disconnect();

  socket = io(socketUrl(), {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function getChatSocket(): Socket | null {
  return socket;
}

export function disconnectChatSocket(): void {
  socket?.disconnect();
  socket = null;
}
