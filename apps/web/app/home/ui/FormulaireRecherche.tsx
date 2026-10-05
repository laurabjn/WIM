'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent } from 'react';

import styles from './FormulaireRecherche.module.css';

const CATEGORIES = ['NATURE', 'BEACH', 'CITY', 'CULTURE'] as const;

export function FormulaireRecherche() {
  const t = useTranslations();
  const router = useRouter();
  const parametres = useSearchParams();

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const champs = new FormData(evenement.currentTarget);
    const suivants = new URLSearchParams();

    for (const [cle, valeur] of champs.entries()) {
      const texte = String(valeur).trim();

      if (texte) suivants.set(cle, texte);
    }

    const requete = suivants.toString();

    router.push(requete ? `/search?${requete}` : '/search');
  }

  return (
    <form className={styles.formulaire} onSubmit={soumettre}>
      <label className={styles.champ}>
        <span className={styles.libelle}>{t('search.destination')}</span>
        <input
          name="city"
          type="text"
          defaultValue={parametres.get('city') ?? ''}
          placeholder={t('search.destination')}
        />
      </label>

      <label className={styles.champ}>
        <span className={styles.libelle}>{t('search.startDate')}</span>
        <input
          name="startDate"
          type="date"
          defaultValue={parametres.get('startDate') ?? ''}
        />
      </label>

      <label className={styles.champ}>
        <span className={styles.libelle}>{t('search.endDate')}</span>
        <input
          name="endDate"
          type="date"
          defaultValue={parametres.get('endDate') ?? ''}
        />
      </label>

      <label className={styles.champ}>
        <span className={styles.libelle}>{t('home.travelers')}</span>
        <input
          name="capacity"
          type="number"
          min={1}
          defaultValue={parametres.get('capacity') ?? ''}
        />
      </label>

      <label className={styles.champ}>
        <span className={styles.libelle}>{t('search.categories')}</span>
        <select name="category" defaultValue={parametres.get('category') ?? ''}>
          <option value="">{t('search.allCategories')}</option>

          {CATEGORIES.map((categorie) => (
            <option key={categorie} value={categorie}>
              {t(`search.category.${categorie.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className={styles.bouton}>
        {t('common.search')}
      </button>
    </form>
  );
}
