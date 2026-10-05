import { io, type Socket } from 'socket.io-client';

import { API_URL } from 'app/home/infrastructure/api';

const WS_NAMESPACE = process.env.NEXT_PUBLIC_WS_NAMESPACE ?? '/ws';

function adresse() {
  return `${API_URL.replace(/\/api\/?$/, '')}${WS_NAMESPACE}`;
}

let socket: Socket | null = null;

export function connectChatSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket?.disconnect();

  socket = io(adresse(), {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectChatSocket(): void {
  socket?.disconnect();
  socket = null;
}
