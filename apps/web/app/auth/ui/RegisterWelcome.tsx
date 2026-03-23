'use client';

import React from 'react';
import styles from './RegisterWelcome.module.css';
import Image from 'next/image';

type Props = {
  welcomeTitle: string;
  guidedTourLabel: string;
  goToWimLabel: string;
  onGuidedTour?: () => void;
  onGoToWim: () => void;
};

export const RegisterWelcome: React.FC<Props> = ({
  welcomeTitle,
  guidedTourLabel,
  goToWimLabel,
  onGuidedTour,
  onGoToWim,
}) => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.centerSection}>
          <div className={styles.centerContent}>
            <div className={styles.logo}>
              <Image src="/logo.jpg" alt="Wim" width={42} height={42} />
            </div>

            <h1 className={styles.title}>
              {welcomeTitle}
            </h1>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            onClick={onGuidedTour}
          >
            {guidedTourLabel}
          </button>

          <button
            className={styles.primaryButton}
            onClick={onGoToWim}
          >
            {goToWimLabel}
          </button>
        </div>
      </div>
    </div>
  );
};