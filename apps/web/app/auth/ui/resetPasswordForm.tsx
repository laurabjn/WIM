'use client';

import React, { useState } from 'react';
import { resetPassword } from '../application/resetPassword.usecase';
import { useTranslations } from 'next-intl';

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const t = useTranslations('auth');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirm) {
      setError(t('requiredFields'));
      return;
    }

    if (newPassword !== confirm) {
      setError(t('resetErrorPasswordsDontMatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      setSuccess(t('resetSuccess'));
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h1 data-testid="reset-password-title">{t('resetPasswordTitle')}</h1>
        <label htmlFor="newPassword" data-testid="new-password-label">{t('newPassword')}</label>
        <input
          id="newPassword"
          data-testid="new-password-input"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" data-testid="confirm-password-label">{t('confirmPassword')}</label>
        <input
          id="confirmPassword"
          data-testid="confirm-password-input"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {error && <p role="alert" data-testid="error-input">{error}</p>}
      {success && <p role="status" data-testid="success-input">{success}</p>}

      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? t('resettingPassword') : t('resetPassword')}
      </button>
    </form>
  );
};