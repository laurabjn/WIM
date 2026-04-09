import { useEffect, useState } from 'react';
import type { UserProfile } from '@wim/shared';
import { getPublicProfile } from '../profile.api';

export function usePublicProfile(userId: string | undefined, token?: string | null) {
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    if (!userId) {
      setIsLoading(false);
      setError('Missing userId');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getPublicProfile(userId, token);
      console.log('PUBLIC PROFILE DATA:', data);
      setProfile(data);
    } catch (err) {
      console.log('usePublicProfile catch:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load public profile');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [userId, token]);

  return {
    profile,
    isLoading,
    error,
    reload: loadProfile,
  };
}