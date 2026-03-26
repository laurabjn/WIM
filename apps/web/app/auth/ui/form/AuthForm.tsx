'use client';

import React from 'react';
import styles from './AuthForm.module.css';
import Image from 'next/image';

type Props = {
  welcomeTitle: string;
  createAccountLabel: string;
  loginLabel: string;
  onCreateAccount: () => void;
  onLogin: () => void;
};

export const AuthForm: React.FC<Props> = ({
  welcomeTitle,
  createAccountLabel,
  loginLabel,
  onCreateAccount,
  onLogin,
}) => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image src="/logo.jpg" alt="Wim" width={42} height={42} />
        </div>

        <h1 className={styles.title}>{welcomeTitle}</h1>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            onClick={onCreateAccount}
          >
            {createAccountLabel}
          </button>

          <button
            className={styles.secondaryButton}
            onClick={onLogin}
          >
            {loginLabel}
          </button>
        </div>
      </div>
    </div>
  );
};