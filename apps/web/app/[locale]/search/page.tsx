import { getTranslations } from 'next-intl/server';

import { Navbar } from 'app/ui/component/Navbar';
import { searchHomes, type FiltresRecherche } from 'app/home/infrastructure/home.api';
import { HomeDetailsCard } from 'app/home/ui/components/HomeDetailsCard';
import { FormulaireRecherche } from 'app/home/ui/FormulaireRecherche';
import Link from 'next/link';

import styles from './page.module.css';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CATEGORIES = ['NATURE', 'BEACH', 'CITY', 'CULTURE'] as const;
const PAR_PAGE = 12;

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

  const pages = Math.max(1, Math.ceil(logements.length / PAR_PAGE));
  const page = Math.min(Math.max(1, nombre(parametres.page) ?? 1), pages);
  const visibles = logements.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function versLaPage(cible: number) {
    const suivants = new URLSearchParams();

    for (const [cle, valeur] of Object.entries(parametres)) {
      const texte = premier(valeur);

      if (texte && cle !== 'page') suivants.set(cle, texte);
    }

    if (cible > 1) suivants.set('page', String(cible));

    const requete = suivants.toString();

    return requete ? `/search?${requete}` : '/search';
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.contenu}>
        <h1 className={styles.titre}>{t('search.search')}</h1>

        <p className={styles.sousTitre}>{t('search.pageSubtitle')}</p>

        <FormulaireRecherche />

        <p className={styles.compte}>
          {logements.length} {t('search.results')}
        </p>

        {logements.length === 0 ? (
          <p className={styles.vide}>{t('search.noResults')}</p>
        ) : (
          <div className={styles.resultats}>
            {visibles.map((logement) => (
              <HomeDetailsCard key={logement.id} home={logement} />
            ))}
          </div>
        )}

        {pages > 1 ? (
          <nav className={styles.pagination} aria-label={t('common.search')}>
            {page > 1 ? (
              <Link className={styles.pageLien} href={versLaPage(page - 1)}>
                {t('common.previousPage')}
              </Link>
            ) : null}

            {Array.from({ length: pages }, (_, index) => index + 1).map(
              (numero) => (
                <Link
                  key={numero}
                  href={versLaPage(numero)}
                  aria-current={numero === page ? 'page' : undefined}
                  className={
                    numero === page
                      ? `${styles.pageLien} ${styles.pageActive}`
                      : styles.pageLien
                  }
                >
                  {numero}
                </Link>
              ),
            )}

            {page < pages ? (
              <Link className={styles.pageLien} href={versLaPage(page + 1)}>
                {t('common.nextPage')}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
