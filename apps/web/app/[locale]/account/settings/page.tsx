import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Parametres } from 'app/profile/ui/Parametres';
import { Navbar } from 'app/ui/component/Navbar';

import styles from '../page.module.css';

export default async function SettingsPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <nav className={styles.fil} aria-label={t('profile.settings.title')}>
          <Link href="/account" className={styles.filLien}>
            {t('profile.settings.account')}
          </Link>

          <span aria-hidden="true">›</span>

          <span className={styles.filCourant}>
            {t('profile.settings.title')}
          </span>
        </nav>

        <h1 className={styles.titre}>{t('profile.settings.title')}</h1>

        <Parametres />
      </section>
    </main>
  );
}
