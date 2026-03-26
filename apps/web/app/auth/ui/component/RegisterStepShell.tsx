import React from 'react';
import styles from './RegisterStepShell.module.css';

type Props = {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  onBack?: () => void;
};

export const RegisterStepShell: React.FC<Props> = ({
  title,
  children,
  footer,
  onBack,
}) => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div>
          <header className={styles.header}>
            <button className={styles.backButton} onClick={onBack}>
              ←
            </button>
            <h1 className={styles.headerTitle}>{title}</h1>
          </header>

          <div className={styles.content}>{children}</div>
        </div>

        <div>{footer}</div>
      </div>
    </div>
  );
};