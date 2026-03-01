'use client';

import React, { useState } from 'react';
import { requestPasswordReset } from '../application/requestPasswordReset.usecase';
import { useTranslations, useLocale } from 'next-intl';

export const ForgotPasswordForm: React.FC = () => {
  const t = useTranslations('auth');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError(t('requiredFields'));
      return;
    }

    const localeForApi: 'fr' | 'en' = locale === 'en' ? 'en' : 'fr';

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email, localeForApi);
      setSuccessMessage(t('forgotSuccess'));
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 data-testid="forgot-password-title">{t('forgotPasswordTitle')}</h1>
      <p>{t('forgotPasswordDescription')}</p>

      <div>
        <label htmlFor="email" data-testid="email-label">{t('email')}</label>
        <input
          id="email"
          data-testid="email-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && <p role="alert" data-testid="error-input">{error}</p>}
      {successMessage && <p role="status" data-testid="success-input">{successMessage}</p>}

      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? t('sendingResetLink') : t('sendResetLink')}
      </button>
    </form>
  );
};