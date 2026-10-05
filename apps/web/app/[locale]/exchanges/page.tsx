import { getTranslations } from 'next-intl/server';

import { Echanges } from 'app/exchange/ui/Echanges';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function ExchangesPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('common.exchanges')}</h1>

        <Echanges />
      </section>
    </main>
  );
}
