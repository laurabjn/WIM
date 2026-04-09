import { useEffect, useState } from 'react';
import { getFavoriteHomes } from '../favorites.api';
import { FavoriteHome } from '@wim/shared';

export function useFavoriteHomes(token: string | null) {
  const [favorites, setFavorites] = useState<FavoriteHome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFavorites() {
    if (!token) {
      setIsLoading(false);
      setError('Missing token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getFavoriteHomes(token);
      setFavorites(data);
    } catch (err) {
      console.log('useFavoriteHomes error:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load favorites');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, [token]);

  return {
    favorites,
    isLoading,
    error,
    reloadFavorites: loadFavorites,
  };
}