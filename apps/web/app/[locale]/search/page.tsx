import { getTranslations } from 'next-intl/server';

import { Navbar } from 'app/ui/component/Navbar';
import { searchHomes, type FiltresRecherche } from 'app/home/infrastructure/home.api';
import { HomeDetailsCard } from 'app/home/ui/components/HomeDetailsCard';
import { FormulaireRecherche } from 'app/home/ui/FormulaireRecherche';

import styles from './page.module.css';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CATEGORIES = ['NATURE', 'BEACH', 'CITY', 'CULTURE'] as const;

function premier(valeur: string | string[] | undefined) {
  return Array.isArray(valeur) ? valeur[0] : valeur;
}

function nombre(valeur: string | string[] | undefined) {
  const texte = premier(valeur);
  const converti = texte ? Number(texte) : NaN;

  return Number.isFinite(converti) && converti > 0 ? converti : undefined;
}

function categorie(valeur: string | string[] | undefined) {
  const texte = premier(valeur);

  return CATEGORIES.find((candidate) => candidate === texte);
}

export default async function SearchPage({ searchParams }: Props) {
  const parametres = await searchParams;
  const t = await getTranslations();

  const filtres: FiltresRecherche = {
    city: premier(parametres.city),
    country: premier(parametres.country),
    capacity: nombre(parametres.capacity),
    bedrooms: nombre(parametres.bedrooms),
    homeType: premier(parametres.homeType),
    category: categorie(parametres.category),
    startDate: premier(parametres.startDate),
    endDate: premier(parametres.endDate),
  };

  const logements = await searchHomes(filtres).catch(() => []);

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('common.search')}</h1>

        <FormulaireRecherche />

        <p className={styles.compte}>
          {logements.length} {t('search.results')}
        </p>

        {logements.length === 0 ? (
          <p className={styles.vide}>{t('search.noResults')}</p>
        ) : (
          <div className={styles.resultats}>
            {logements.map((logement) => (
              <HomeDetailsCard key={logement.id} home={logement} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
