import { useEffect, useMemo, useState } from 'react';
import type { Exchange } from '@wim/shared';
import { getMyExchanges } from '../exchange.api';
import { exchangeMocks } from '../mocks/exchangeMocks';

export function useMyExchanges(token: string | null) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadExchanges() {
    if (!token) {
      setLoading(false);
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getMyExchanges(token);
      setExchanges(exchangeMocks); // Replace with: setExchanges(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExchanges();
  }, [token]);

  const currentExchanges = useMemo(
    () => exchanges.filter((exchange) => exchange.status === 'CURRENT'),
    [exchanges],
  );

  const futureExchanges = useMemo(
    () => exchanges.filter((exchange) => exchange.status === 'FUTURE'),
    [exchanges],
  );

  const pastExchanges = useMemo(
    () => exchanges.filter((exchange) => exchange.status === 'PAST'),
    [exchanges],
  );

  return {
    exchanges,
    currentExchanges,
    futureExchanges,
    pastExchanges,
    loading,
    error,
    refresh: loadExchanges,
  };
}