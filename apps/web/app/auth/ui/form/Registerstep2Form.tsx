'use client';

import React from 'react';
import { Stepper } from '../component/Stepper';
import { COUNTRY_OPTIONS, NATIONALITY_OPTIONS } from '../../../../../../packages/shared/src/utils/locationOptions';
import styles from './RegisterStep2Form.module.css';
import { useTranslations } from 'next-intl';

type Props = {
  title: string;
  sectionTitle: string;
  nationalityLabel: string;
  countryLabel: string;
  continueLabel: string;
  nationality: string;
  country: string;
  onNationalityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  isContinueDisabled: boolean;
};

export const RegisterStep2Form: React.FC<Props> = ({
  title,
  sectionTitle,
  nationalityLabel,
  countryLabel,
  continueLabel,
  nationality,
  country,
  onNationalityChange,
  onCountryChange,
  onBack,
  onContinue,
  isContinueDisabled,
}) => {
  const t = useTranslations();
  
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
          <Stepper current={2} total={3} />
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>

          <div className={styles.fields}>
            <select
              className={styles.input}
              value={nationality}
              onChange={(e) => onNationalityChange(e.target.value)}
            >
              <option value="">{nationalityLabel}</option>
              {NATIONALITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {t(`auth.nationalities.${item}`)}
                </option>
              ))}
            </select>

            <select
              className={styles.input}
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
            >
              <option value="">{countryLabel}</option>
              {COUNTRY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {t(`auth.countries.${item}`)}
                </option>
              ))}
            </select>
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