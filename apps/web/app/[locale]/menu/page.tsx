import styles from './page.module.css';
import { getTranslations } from 'next-intl/server';
import { Navbar } from 'app/ui/component/Navbar';
import { getPublicHomes } from 'app/home/infrastructure/home.api';
import { HomeExploreSection } from 'app/home/ui/HomeExploreSection';

export default async function MenuPage() {
  const t = await getTranslations();
  const homes = await getPublicHomes();

  return (
    <main className={styles.menuPage}>
      <Navbar />

      <HomeExploreSection
        homes={homes}
        labels={{
          toExplore: t('search.toExplore'),
          fastSearch: t('search.fastSearch'),
          lastSearches: t('search.lastSearches'),
        }}
      />
    </main>
  );
}