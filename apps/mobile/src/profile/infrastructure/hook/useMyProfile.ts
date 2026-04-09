import { useEffect, useState } from 'react';
import type { UserProfile } from '@wim/shared';
import { getMyProfile, updateMyProfile } from '../profile.api';

export function useMyProfile(token: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    if (!token) {
      setIsLoading(false);
      setError('Missing token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyProfile(token);
      console.log('PROFILE DATA:', data);
      setProfile(data);
    } catch (err) {
      console.log('useMyProfile catch:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function saveProfile(payload: Partial<UserProfile>) {
    if (!token) {
      throw new Error('Missing token');
    }

    const updated = await updateMyProfile(token, payload);
    setProfile(updated);
    return updated;
  }

  useEffect(() => {
    loadProfile();
  }, [token]);

  return {
    profile,
    isLoading,
    error,
    reload: loadProfile,
    saveProfile,
  };
}