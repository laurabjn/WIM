import { Home } from '@wim/shared/home/home.type';
import { useState } from 'react';
import { searchHomesApi } from '../searchHome.api';

type Filters = {
  city?: string;
  country?: string;
  capacity?: number;
  homeType?: string;
  startDate?: string;
  endDate?: string;
};

export function useSearchHomes(token?: string) {
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(filters: Filters) {
    if (!token) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await searchHomesApi(token, filters);
      setHomes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  return {
    homes,
    loading,
    error,
    search,
  };
}