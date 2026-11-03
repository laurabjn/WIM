'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import styles from './FiltresRapides.module.css';

const CATEGORIES = [
  { cle: 'NATURE', classe: 'nature', icone: '♣' },
  { cle: 'BEACH', classe: 'beach', icone: '≋' },
  { cle: 'CITY', classe: 'city', icone: '♜' },
  { cle: 'CULTURE', classe: 'culture', icone: '▥' },
] as const;

const EQUIPEMENTS = ['pool', 'parking', 'wifi'] as const;

export function FiltresRapides() {
  const t = useTranslations('search.filters');
  const parametres = useSearchParams();

  function lienAvec(cle: string, valeur: string) {
    const suivants = new URLSearchParams(parametres.toString());

    suivants.delete('page');

    if (suivants.get(cle) === valeur) suivants.delete(cle);
    else suivants.set(cle, valeur);

    const requete = suivants.toString();

    return requete ? `/search?${requete}` : '/search';
  }

  const equipementsActifs = (parametres.get('amenities') ?? '')
    .split(',')
    .filter(Boolean);

  function lienEquipement(nom: string) {
    const suivants = new URLSearchParams(parametres.toString());

    suivants.delete('page');

    const apres = equipementsActifs.includes(nom)
      ? equipementsActifs.filter((autre) => autre !== nom)
      : [...equipementsActifs, nom];

    if (apres.length) suivants.set('amenities', apres.join(','));
    else suivants.delete('amenities');

    const requete = suivants.toString();

    return requete ? `/search?${requete}` : '/search';
  }

  return (
    <div className={styles.rangee}>
      {CATEGORIES.map(({ cle, classe, icone }) => (
        <Link
          key={cle}
          href={lienAvec('category', cle)}
          className={`${styles.puce} ${
            parametres.get('category') === cle ? styles.puceActive : ''
          }`.trim()}
        >
          <span className={`${styles.pastille} ${styles[classe]}`}>{icone}</span>
          {t(`categories.${cle}`)}
        </Link>
      ))}

      {EQUIPEMENTS.map((nom) => (
        <Link
          key={nom}
          href={lienEquipement(nom)}
          className={`${styles.puce} ${
            equipementsActifs.includes(nom) ? styles.puceActive : ''
          }`.trim()}
        >
          {t(`equipments.${nom}`)}
        </Link>
      ))}
    </div>
  );
}
