'use client';

import React from 'react';
import { Stepper } from '../component/Stepper';
import styles from './RegisterStep3Form.module.css';

type Props = {
  title: string;
  sectionTitle: string;
  emailLabel: string;
  phoneLabel: string;
  continueLabel: string;
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  isContinueDisabled: boolean;
};

export const RegisterStep3Form: React.FC<Props> = ({
  title,
  sectionTitle,
  emailLabel,
  phoneLabel,
  continueLabel,
  email,
  phone,
  onEmailChange,
  onPhoneChange,
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
          <Stepper current={3} total={3} />
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>

          <div className={styles.fields}>
            <input
              type="email"
              className={styles.input}
              placeholder={emailLabel}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder={phoneLabel}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
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