import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { UnreadCountUpdatedSocketPayload } from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { getUnreadCountApi } from '../infrastructure/chat.api';
import { connectChatSocket } from '../infrastructure/chatSocket';

const REFRESH_INTERVAL_MS = 60000;

export function useUnreadMessages(): number {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) {
        setCount(0);
        return;
      }

      const result = await getUnreadCountApi(session.accessToken);
      setCount(result.count);
    } catch (error) {
      console.log('Unread count error:', error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    refresh();

    async function listen() {
      const session = await getSession();

      if (!session?.accessToken || cancelled) return;

      const socket = connectChatSocket(session.accessToken);

      function handleUnread(payload: UnreadCountUpdatedSocketPayload) {
        setCount(payload.count);
      }

      socket.on('unread:updated', handleUnread);

      cleanup = () => socket.off('unread:updated', handleUnread);
    }

    listen();

    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      cancelled = true;
      cleanup?.();
      clearInterval(interval);
      subscription.remove();
    };
  }, [refresh]);

  return count;
}
