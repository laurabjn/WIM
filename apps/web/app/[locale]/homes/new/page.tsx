import { getTranslations } from 'next-intl/server';

import { FormulaireLogement } from 'app/home/ui/FormulaireLogement';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default async function NewHomePage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('profile.addHome')}</h1>

        <FormulaireLogement />
      </section>
    </main>
  );
}
