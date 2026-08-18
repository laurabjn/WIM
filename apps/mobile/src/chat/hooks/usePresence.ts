import { useEffect, useState } from 'react';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { connectChatSocket } from '../infrastructure/chatSocket';

type PresenceChange = {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string | null;
};

export type Presence = {
  /** Identifiants actuellement connectes. */
  online: Set<string>;
  /** Derniere presence connue des autres, en ISO. */
  lastSeen: Map<string, string>;
};

const VIDE: Presence = { online: new Set(), lastSeen: new Map() };

export function usePresence(userIds: string[]): Presence {
  const [presence, setPresence] = useState<Presence>(VIDE);

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
          (statuts: PresenceChange[]) => {
            if (cancelled) return;

            const online = new Set<string>();
            const lastSeen = new Map<string, string>();

            for (const statut of statuts ?? []) {
              if (statut.isOnline) online.add(statut.userId);
              else if (statut.lastSeenAt)
                lastSeen.set(statut.userId, statut.lastSeenAt);
            }

            setPresence({ online, lastSeen });
          },
        );
      }

      function handleChange(change: PresenceChange) {
        setPresence((current) => {
          const online = new Set(current.online);
          const lastSeen = new Map(current.lastSeen);

          if (change.isOnline) {
            online.add(change.userId);
            // Une personne revenue en ligne n'a plus de "vu il y a" a montrer.
            lastSeen.delete(change.userId);
          } else {
            online.delete(change.userId);

            if (change.lastSeenAt)
              lastSeen.set(change.userId, change.lastSeenAt);
          }

          return { online, lastSeen };
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

  return presence;
}
