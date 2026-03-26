'use client';

import React from 'react';
import styles from './RegisterStep4Form.module.css';

type Props = {
  title: string;
  sectionTitle: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  continueLabel: string;
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  isContinueDisabled: boolean;
};

export const RegisterStep4Form: React.FC<Props> = ({
  title,
  sectionTitle,
  passwordLabel,
  confirmPasswordLabel,
  continueLabel,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onBack,
  onContinue,
  isContinueDisabled,
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
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>

          <div className={styles.fields}>
            <input
              type="password"
              className={styles.input}
              placeholder={passwordLabel}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />

            <input
              type="password"
              className={styles.input}
              placeholder={confirmPasswordLabel}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
            />
          </div>
        </div>
        <footer className={styles.footer}>
          <button
            className={styles.continueButton}
            onClick={onContinue}
            disabled={isContinueDisabled}
          >
            {continueLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};