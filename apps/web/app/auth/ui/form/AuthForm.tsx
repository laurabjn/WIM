'use client';

import React, { useState } from 'react';
import styles from './AuthForm.module.css';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { socialSignInApi } from 'app/auth/infrastructure/authApi';
import {
  appleEstConfigure,
  googleEstConfigure,
  jetonApple,
  jetonGoogle,
} from 'app/auth/infrastructure/connexionSociale';

type Props = {
  onCreateAccount: () => void;
  onLogin: () => void;
  onConnecte: () => void;
};

export const AuthForm: React.FC<Props> = ({
  onCreateAccount,
  onLogin,
  onConnecte,
}) => {
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');

  const [enCours, setEnCours] = useState<'GOOGLE' | 'APPLE' | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function connecter(provider: 'GOOGLE' | 'APPLE') {
    setErreur(null);
    setEnCours(provider);

    try {
      const idToken =
        provider === 'GOOGLE' ? await jetonGoogle() : await jetonApple();

      if (!idToken) return;

      await socialSignInApi({ provider, idToken });
      onConnecte();
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setEnCours(null);
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.logoSection}>
        <Image
          src="/logo.jpg"
          alt="Wim"
          width={420}
          height={420}
          className={styles.bigLogo}
          priority
        />
      </section>

      <section className={styles.loginCard}>
        <h1 className={styles.title}>
          {tCommon('browse')}
          <br />
          <span>{tCommon('world')}</span>
        </h1>

        <p className={styles.subtitle}>{tAuth('register.signUp')}</p>

        {googleEstConfigure ? (
          <button
            className={styles.socialButton}
            onClick={() => connecter('GOOGLE')}
            disabled={enCours !== null}
          >
            <Image
              src="/google.svg"
              alt=""
              width={20}
              height={20}
              className={styles.marque}
            />
            {tAuth('register.signUpWithGoogle')}
          </button>
        ) : null}

        {appleEstConfigure ? (
          <button
            className={styles.socialButton}
            onClick={() => connecter('APPLE')}
            disabled={enCours !== null}
          >
            <Image
              src="/apple.svg"
              alt=""
              width={20}
              height={20}
              className={styles.marque}
            />
            {tAuth('register.signUpWithApple')}
          </button>
        ) : null}

        <button className={styles.createButton} onClick={onCreateAccount}>
          {tAuth('register.signUpWithEmail')}
        </button>

        {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

        <small className={styles.legalText}>
          {tAuth('register.usageConditions')}
        </small>

        <div className={styles.loginBottom}>
          <p>{tAuth('alreadyHaveAccount')}</p>

          <button className={styles.loginButton} onClick={onLogin}>
            {tAuth('login.login')}
          </button>
        </div>
      </section>
    </main>
  );
};
