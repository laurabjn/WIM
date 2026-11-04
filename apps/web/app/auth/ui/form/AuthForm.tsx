'use client';

import React from 'react';
import styles from './AuthForm.module.css';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { BoutonsFournisseurs } from 'app/auth/ui/component/BoutonsFournisseurs';

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

        <div className={styles.fournisseurs}>
          <BoutonsFournisseurs
            libelleGoogle={tAuth('register.signUpWithGoogle')}
            libelleApple={tAuth('register.signUpWithApple')}
            onConnecte={onConnecte}
          />
        </div>

        <button className={styles.createButton} onClick={onCreateAccount}>
          {tAuth('register.signUpWithEmail')}
        </button>

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
