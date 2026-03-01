import React from 'react';
import { useTranslations } from 'next-intl';
import { ResetPasswordForm } from '../../auth/ui/resetPasswordForm';

interface ResetPasswordPageProps {
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const token = searchParams.token;
    const t = useTranslations('auth');

  if (!token) {
    return (
      <main>
        <p data-testid="missing-token-message">{t('missingToken')}</p>
      </main>
    );
  }

  return (
    <main>
      <ResetPasswordForm token={token} />
    </main>
  );
}