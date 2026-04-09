import { MyHome } from '@wim/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchMyHomes } from '../home.api';

export function useMyHomes(token: string | null) {
  const [homes, setHomes] = useState<MyHome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomes = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMyHomes(token);
      setHomes(data);
    } catch (err) {
      setError('Erreur lors du chargement des logements');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHomes();
  }, [token]);

  return {
    homes,
    isLoading,
    error,
    reloadHomes: loadHomes,
  };
}