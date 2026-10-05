import { getTranslations } from 'next-intl/server';

import { Abonnement } from 'app/subscription/ui/Abonnement';
import { Parrainage } from 'app/subscription/ui/Parrainage';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function SubscriptionPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('subscription.title')}</h1>

        <Abonnement />

        <Parrainage />
      </section>
    </main>
  );
}
