'use client';

import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { loginUser } from 'app/auth/application/loginUser.usecase';
import Image from 'next/image';

type Props = {
  title: string;
  emailLabel: string;
  passwordLabel: string;
  forgotPasswordLabel: string;
  submitLabel: string;
  loadingLabel: string;
  googleSignUpLabel: string;
  appleSignUpLabel: string;
  onBack: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
};

export const LoginForm: React.FC<Props> = ({
  title,
  emailLabel,
  passwordLabel,
  forgotPasswordLabel,
  submitLabel,
  loadingLabel,
  googleSignUpLabel,
  appleSignUpLabel,
  onBack,
  onForgotPassword,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginUser({ email, password });
      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>       
            <div className={styles.conterSection}>
              <div className={styles.logo}>
                  <Image src="/logo.jpg" alt="Wim" width={42} height={42} />
              </div>

              <h1 className={styles.title}>{title}</h1>
                      
              <div className={styles.actions}>
                  <button className={styles.secondaryButton}>
                      <span>{googleSignUpLabel}</span>
                  </button>

                  <button className={styles.secondaryButton}>
                      <span>{appleSignUpLabel}</span>
                  </button>
              </div>

              <div className={styles.fields}>
                <input
                className={styles.input}
                type="email"
                placeholder={emailLabel}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />

                <input
                className={styles.input}
                type="password"
                placeholder={passwordLabel}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />

                <button
                type="button"
                onClick={onForgotPassword}
                className={styles.linkButton}
                >
                {forgotPasswordLabel}
                </button>

                {error && <p className={styles.error}>{error}</p>}
              </div>
            </div>

            <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? loadingLabel : submitLabel}
            </button>
        </div>
    </div>
  );
};