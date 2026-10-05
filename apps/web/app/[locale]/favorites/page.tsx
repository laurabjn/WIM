import { getTranslations } from 'next-intl/server';

import { Favoris } from 'app/home/ui/Favoris';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function FavoritesPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('profile.favorites')}</h1>

        <Favoris />
      </section>
    </main>
  );
}
