import { MonCompte } from 'app/profile/ui/MonCompte';
import { Navbar } from 'app/ui/component/Navbar';

import styles from './page.module.css';

export default function AccountPage() {
  return (
    <main className={styles.page}>
      <Navbar />

      <section className={`${styles.contenu} ${styles.contenuProfil}`}>
        <MonCompte />
      </section>
    </main>
  );
}
