import Link from 'next/link';
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
        <nav className={styles.fil} aria-label={t('subscription.manageTitle')}>
          <Link href="/account" className={styles.filLien}>
            {t('profile.settings.account')}
          </Link>

          <span aria-hidden="true">›</span>

          <span className={styles.filCourant}>
            {t('subscription.manageTitle')}
          </span>
        </nav>

        <h1 className={styles.titre}>{t('subscription.manageTitle')}</h1>

        <Abonnement />

        <Parrainage />
      </section>
    </main>
  );
}
