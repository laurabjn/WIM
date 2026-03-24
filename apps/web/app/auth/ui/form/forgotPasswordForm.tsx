'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './forgotPasswordForm.module.css';
import Image from 'next/image';
import { requestPasswordReset } from 'app/auth/application/requestPasswordReset.usecase';

export const ForgotPasswordForm: React.FC = () => {
  const t = useTranslations();
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
      setError(t('auth.requiredFields'));
      return;
    }

    const localeForApi: 'fr' | 'en' = locale === 'en' ? 'en' : 'fr';

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email, localeForApi);
      setSuccessMessage(t('auth.login.forgotSuccess'));
    } catch (err: any) {
      setError(err.message ?? t('auth.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <form onSubmit={handleSubmit} className={styles.main}>
          <div className={styles.logo}>
            <Image src="/logo.jpg" alt="Wim" width={42} height={42} />
          </div>

          <h1
            className={styles.title}
            data-testid="forgot-password-title"
          >
            {t('auth.login.forgotPasswordSearchTitle')}
          </h1>

          <p className={styles.description}>
            {t('auth.login.forgotPasswordSearchDescription')}
          </p>

          <div className={styles.fields}>
            <input
              id="email"
              data-testid="email-input"
              className={styles.input}
              type="email"
              autoComplete="email"
              placeholder={t('auth.login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && (
              <p role="alert" data-testid="error-input" className={styles.error}>
                {error}
              </p>
            )}

            {successMessage && (
              <p
                role="status"
                data-testid="success-input"
                className={styles.success}
              >
                {successMessage}
              </p>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="submit-button"
              className={styles.primaryButton}
            >
              {isSubmitting
                ? t('auth.login.sendingResetLink')
                : t('auth.login.sendResetLink')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};