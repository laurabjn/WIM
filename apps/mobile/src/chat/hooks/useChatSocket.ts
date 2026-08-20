import { useEffect } from 'react';
import type {
  MessageCreatedSocketPayload,
  MessagesReadSocketPayload,
} from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { connectChatSocket } from '../infrastructure/chatSocket';

type TypingPayload = {
  chatId: string;
  userId: string;
  isTyping: boolean;
};

type Options = {
  chatId: string;
  onMessage: (payload: MessageCreatedSocketPayload) => void;
  onMessageUpdated?: (payload: MessageCreatedSocketPayload) => void;
  onMessageDeleted?: (payload: { chatId: string; messageId: string }) => void;
  onRead?: (payload: MessagesReadSocketPayload) => void;
  onTyping?: (payload: TypingPayload) => void;
};

export function useChatSocket({
  chatId,
  onMessage,
  onRead,
  onTyping,
  onMessageUpdated,
  onMessageDeleted,
}: Options): void {
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

      function handleTyping(payload: TypingPayload) {
        if (payload.chatId === chatId) onTyping?.(payload);
      }

      function handleUpdated(payload: MessageCreatedSocketPayload) {
        if (payload.chatId === chatId) onMessageUpdated?.(payload);
      }

      function handleDeleted(payload: { chatId: string; messageId: string }) {
        if (payload.chatId === chatId) onMessageDeleted?.(payload);
      }

      if (socket.connected) join();

      socket.on('connect', join);
      socket.on('message:created', handleMessage);
      socket.on('messages:read', handleRead);
      socket.on('typing:changed', handleTyping);
      socket.on('message:updated', handleUpdated);
      socket.on('message:deleted', handleDeleted);

      cleanup = () => {
        socket.emit('chat:leave', { chatId });
        socket.off('connect', join);
        socket.off('message:created', handleMessage);
        socket.off('messages:read', handleRead);
        socket.off('typing:changed', handleTyping);
        socket.off('message:updated', handleUpdated);
        socket.off('message:deleted', handleDeleted);
      };
    }

    connect();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [
    chatId,
    onMessage,
    onRead,
    onTyping,
    onMessageUpdated,
    onMessageDeleted,
  ]);
}
