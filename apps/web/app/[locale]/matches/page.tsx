import { getTranslations } from 'next-intl/server';

import { Matchs } from 'app/chat/ui/Matchs';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function MatchesPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('chat.matches')}</h1>

        <Matchs />
      </section>
    </main>
  );
}
