import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { getUnreadCountApi } from '../infrastructure/chat.api';

const REFRESH_INTERVAL_MS = 30000;

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
    refresh();

    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refresh]);

  return count;
}
