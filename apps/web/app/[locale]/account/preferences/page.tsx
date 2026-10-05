import { getTranslations } from 'next-intl/server';

import { Preferences } from 'app/profile/ui/Preferences';
import { Navbar } from 'app/ui/component/Navbar';

import styles from '../page.module.css';

export default async function PreferencesPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>
          {t('profile.preferencesTravel.title')}
        </h1>

        <Preferences />
      </section>
    </main>
  );
}
