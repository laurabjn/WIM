'use client';

import React from 'react';
import styles from './RegisterIdentityForm.module.css';

type Props = {
  title: string;
  sectionTitle: string;
  continueLabel: string;
  identityRedirectUrl: string | null;
  onBack: () => void;
  onOpenIdentity: () => void;
  onContinue: () => void;
};

export const RegisterIdentityForm: React.FC<Props> = ({
  title,
  sectionTitle,
  continueLabel,
  onBack,
  onContinue,
}) => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            onClick={onBack}
            className={styles.backButton}
          >
            ←
          </button>
          <h1 className={styles.headerTitle}>{title}</h1>
        </header>

        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>
            {sectionTitle}
          </h2>
        </div>
        <footer className={styles.footer}>
          <button
            className={styles.continueButton}
            onClick={onContinue}
          >
            {continueLabel}
          </button>
          </footer>
      </div>
    </div>
  );
};