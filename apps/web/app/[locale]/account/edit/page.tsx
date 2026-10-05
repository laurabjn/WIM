import { getTranslations } from 'next-intl/server';

import { EditionProfil } from 'app/profile/ui/EditionProfil';
import { Navbar } from 'app/ui/component/Navbar';

import styles from '../page.module.css';

export default async function EditAccountPage() {
  const t = await getTranslations();

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('profile.editProfile.title')}</h1>

        <EditionProfil />
      </section>
    </main>
  );
}
