'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getIsAdmin } from 'app/auth/infrastructure/authStorage';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const router = useRouter();
  const t = useTranslations('auth');
  const isAdmin = getIsAdmin();

  if (typeof window === 'undefined') return null;

  if (!isAdmin) {
    // Soit rediriges, soit affiches un message.
    return <p>{t('adminNoAccess')}</p>;
    // ou: router.push('/'); return null;
  }

  return <>{children}</>;
};