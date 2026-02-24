'use client';

import React, { useState } from 'react';
import {useTranslations} from 'next-intl';
import { registerUser } from '../application/registerUser.usecase';
import {
  isEmailValid,
  isPasswordValid
} from '@wim/shared'; 

export const RegisterForm: React.FC = () => {
  const t = useTranslations('auth');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password || !firstName || !lastName) {
      setError(t('requiredFields'));
      return;
    }

    if (!isEmailValid(email)) {
      setError(t('emailRules'));
      return;
    }

    if (!isPasswordValid(password)) {
      setError(t('passwordRules'));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      // TODO : redirection / message de succès
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 data-testid="title">{t('title')}</h1>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="firstName" data-testid="first-name-label">{t('firstNameLabel')}</label>
        <input
          id="firstName"
          data-testid="first-name-input"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="lastName" data-testid="last-name-label">{t('lastNameLabel')}</label>
        <input
          id="lastName"
          data-testid="last-name-input"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" data-testid="error-input">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
};
