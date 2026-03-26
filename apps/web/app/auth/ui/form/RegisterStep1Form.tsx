'use client';

import React from 'react';
import { Stepper } from '../component/Stepper';
import stytes from './RegisterStep1Form.module.css';

type Props = {
  title: string;
  sectionTitle: string;
  lastNameLabel: string;
  firstNameLabel: string;
  birthDateLabel: string;
  continueLabel: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  onLastNameChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  isContinueDisabled: boolean;
};

export const RegisterStep1Form: React.FC<Props> = ({
  title,
  sectionTitle,
  lastNameLabel,
  firstNameLabel,
  continueLabel,
  lastName,
  firstName,
  birthDate,
  onLastNameChange,
  onFirstNameChange,
  onBirthDateChange,
  onBack,
  onContinue,
  isContinueDisabled
}) => {
  return (
    <div className={stytes.page}>
      <div className={stytes.container}>
        <header className={stytes.header}>
          <button
            onClick={onBack}
            className={stytes.backButton}
          >
            ←
          </button>
          <h1 className={stytes.headerTitle}>{title}</h1>
        </header>

        <main className={stytes.content}>
          <Stepper current={1} total={3} />
          <h2 className={stytes.sectionTitle}>{sectionTitle}</h2>

          <div className={stytes.fields}>
            <input
              className={stytes.input}
              placeholder={lastNameLabel}
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
            />

            <input
              className={stytes.input}
              placeholder={firstNameLabel}
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
            />

            <input
              type="date"
              className={stytes.input}
              value={birthDate}
              onChange={(e) => onBirthDateChange(e.target.value)}
            />
          </div>
        </main>
        <footer className={stytes.footer}>
          <button
            className={stytes.continueButton}
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