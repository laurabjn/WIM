import { useEffect, useState } from 'react';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { connectChatSocket } from '../infrastructure/chatSocket';

type PresenceChange = {
  userId: string;
  isOnline: boolean;
};

export function usePresence(userIds: string[]): Set<string> {
  const [online, setOnline] = useState<Set<string>>(new Set());

  const key = userIds.slice().sort().join(',');

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function listen() {
      const session = await getSession();

      if (!session?.accessToken || cancelled) return;

      const socket = connectChatSocket(session.accessToken);

      function refresh() {
        socket.emit(
          'presence:list',
          { userIds: key ? key.split(',') : [] },
          (connected: string[]) => {
            if (!cancelled) setOnline(new Set(connected ?? []));
          },
        );
      }

      function handleChange(change: PresenceChange) {
        setOnline((current) => {
          const next = new Set(current);

          if (change.isOnline) next.add(change.userId);
          else next.delete(change.userId);

          return next;
        });
      }

      if (socket.connected) refresh();

      socket.on('connect', refresh);
      socket.on('presence:changed', handleChange);

      cleanup = () => {
        socket.off('connect', refresh);
        socket.off('presence:changed', handleChange);
      };
    }

    listen();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [key]);

  return online;
}
