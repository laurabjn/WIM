import { Home } from '@wim/shared/home/home.type';
import { useCallback, useEffect, useState } from 'react';
import { getHomeById, listMyHomes } from 'src/home/infrastructure/home.api';

export function useMyHomes(token: string | null) {
  const [homes, setHomes] = useState<Home[]>([]);
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
      const data = await listMyHomes(token);
      setHomes(data);
    } catch (err) {
      setError('Erreur lors du chargement des logements');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // async function saveHome(payload: Partial<Home>) {
  //   if (!token) {
  //     throw new Error('Missing token');
  //   }

  //   const updated = await updateMyHome(token, payload);
  //   setHomes(updated);
  //   return updated;
  // }


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