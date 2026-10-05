import { getTranslations } from 'next-intl/server';

import { Notifications } from 'app/notification/ui/Notifications';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function NotificationsPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('notifications.title')}</h1>

        <Notifications />
      </section>
    </main>
  );
}
