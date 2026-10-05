import { getTranslations } from 'next-intl/server';

import { Messagerie } from 'app/chat/ui/Messagerie';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function MessagesPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('chat.title')}</h1>

        <Messagerie />
      </section>
    </main>
  );
}
