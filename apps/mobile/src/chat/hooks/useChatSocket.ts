import { useEffect } from 'react';
import type {
  MessageCreatedSocketPayload,
  MessagesReadSocketPayload,
} from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { connectChatSocket } from '../infrastructure/chatSocket';

type Options = {
  chatId: string;
  onMessage: (payload: MessageCreatedSocketPayload) => void;
  onRead?: (payload: MessagesReadSocketPayload) => void;
};

export function useChatSocket({ chatId, onMessage, onRead }: Options): void {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function connect() {
      const session = await getSession();

      if (!session?.accessToken || cancelled) return;

      const socket = connectChatSocket(session.accessToken);

      function join() {
        socket.emit('chat:join', { chatId });
      }

      function handleMessage(payload: MessageCreatedSocketPayload) {
        if (payload.chatId === chatId) onMessage(payload);
      }

      function handleRead(payload: MessagesReadSocketPayload) {
        if (payload.chatId === chatId) onRead?.(payload);
      }

      if (socket.connected) join();

      socket.on('connect', join);
      socket.on('message:created', handleMessage);
      socket.on('messages:read', handleRead);

      cleanup = () => {
        socket.emit('chat:leave', { chatId });
        socket.off('connect', join);
        socket.off('message:created', handleMessage);
        socket.off('messages:read', handleRead);
      };
    }

    connect();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [chatId, onMessage, onRead]);
}
