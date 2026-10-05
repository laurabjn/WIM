import { getTranslations } from 'next-intl/server';

import { MonCompte } from 'app/profile/ui/MonCompte';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function AccountPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('common.account')}</h1>

        <MonCompte />
      </section>
    </main>
  );
}
