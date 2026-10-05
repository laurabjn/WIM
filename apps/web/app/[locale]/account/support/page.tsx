import { getTranslations } from 'next-intl/server';

import { Assistance } from 'app/profile/ui/Assistance';
import { Navbar } from 'app/ui/component/Navbar';

import styles from '../page.module.css';

export default async function SupportPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('profile.helpScreen.introTitle')}</h1>

        <Assistance />
      </section>
    </main>
  );
}
