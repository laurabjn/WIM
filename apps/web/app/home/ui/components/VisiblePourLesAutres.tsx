'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { getSession } from 'app/auth/infrastructure/authStorage';

type Props = {
  ownerId: string;
  children: ReactNode;
};

export function VisiblePourLesAutres({ ownerId, children }: Props) {
  const [cache, setCache] = useState(false);

  useEffect(() => {
    setCache(getSession()?.user.id === ownerId);
  }, [ownerId]);

  if (cache) return null;

  return <>{children}</>;
}
