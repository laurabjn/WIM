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
        <h1 className={styles.titre}>{t('profile.settings.title')}</h1>

        <Parametres />
      </section>
    </main>
  );
}
