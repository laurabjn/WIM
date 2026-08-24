import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  getStaysToReviewApi,
  type StayToReview,
} from 'src/chat/infrastructure/exchange.api';

export function usePendingStayReview(): StayToReview | null {
  const [sejour, setSejour] = useState<StayToReview | null>(null);

  const charger = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const sejours = await getStaysToReviewApi(session.accessToken);

      setSejour(sejours[0] ?? null);
    } catch (error) {
      console.log('Pending stay review error:', error);
      setSejour(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  return sejour;
}
