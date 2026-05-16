import { useTranslations } from 'next-intl';
import styles from './ReportUserButton.module.css';

export function ReportUserButton() {
  const t = useTranslations();
  return (
    <button className={styles.button}>
      <span>▲</span>
      {t('profile.report')}
    </button>
  );
}