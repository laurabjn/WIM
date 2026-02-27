'use client';

import React, { useState } from 'react';
import {useTranslations} from 'next-intl';
import { loginUser } from '../application/loginUser.usecase';

export const LoginForm: React.FC = () => {
  const t = useTranslations('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t('requiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      await loginUser({ email, password });
      // TODO: redirection ou mise à jour du contexte auth
    } catch (err: any) {
      setError(err.message ?? t('invalidCredentials'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
        <h1 data-testid="title">{t('login')}</h1>
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

      <div>
        <label htmlFor="password" data-testid="password-label">{t('password')}</label>
        <input
          id="password"
          data-testid="password-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p role="alert" data-testid="error-input">{error}</p>}

      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? t('loggingIn') : t('login')}
      </button>
    </form>
  );
};