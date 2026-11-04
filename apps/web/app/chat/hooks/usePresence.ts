import { useEffect, useState } from 'react';

import { connectChatSocket } from '../infrastructure/chatSocket';

type PresenceChange = {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string | null;
};

export type Presence = {
  online: Set<string>;
  lastSeen: Map<string, string>;
};

const VIDE: Presence = { online: new Set(), lastSeen: new Map() };

export function usePresence(token: string | null, userIds: string[]): Presence {
  const [presence, setPresence] = useState<Presence>(VIDE);

  const cle = userIds.slice().sort().join(',');

  useEffect(() => {
    if (!token) {
      setPresence(VIDE);
      return;
    }

    let annule = false;
    const socket = connectChatSocket(token);

    function rafraichir() {
      socket.emit(
        'presence:list',
        { userIds: cle ? cle.split(',') : [] },
        (statuts: PresenceChange[]) => {
          if (annule) return;

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

    function auChangement(change: PresenceChange) {
      setPresence((courant) => {
        const online = new Set(courant.online);
        const lastSeen = new Map(courant.lastSeen);

        if (change.isOnline) {
          online.add(change.userId);
          lastSeen.delete(change.userId);
        } else {
          online.delete(change.userId);

          if (change.lastSeenAt) lastSeen.set(change.userId, change.lastSeenAt);
        }

        return { online, lastSeen };
      });
    }

    if (socket.connected) rafraichir();

    socket.on('connect', rafraichir);
    socket.on('presence:changed', auChangement);

    return () => {
      annule = true;
      socket.off('connect', rafraichir);
      socket.off('presence:changed', auChangement);
    };
  }, [token, cle]);

  return presence;
}
