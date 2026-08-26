import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Exchange } from '@wim/shared';
import { getMyExchanges } from '../exchange.api';
import { resolveImageUrl } from '../home.api';

export function useMyExchanges(token: string | null) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoisee : les ecrans la rappellent a chaque prise de focus, et une
  // fonction recreee a chaque rendu y declencherait une boucle.
  const loadExchanges = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getMyExchanges(token);

      setExchanges(
        data.map((exchange) => ({
          ...exchange,
          homeImageUrl: resolveImageUrl(exchange.homeImageUrl),
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadExchanges();
  }, [loadExchanges]);

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