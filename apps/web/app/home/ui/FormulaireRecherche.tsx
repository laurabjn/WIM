'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

import { getPublicHomes } from 'app/home/infrastructure/home.api';
import {
  lireDestinationsRecentes,
  retenirDestination,
} from 'app/home/infrastructure/destinationsRecentes';
import styles from './FormulaireRecherche.module.css';

const CATEGORIES = ['NATURE', 'BEACH', 'CITY', 'CULTURE'] as const;
const MAX_POPULAIRES = 3;

type Volet = 'ou' | 'quand' | 'filtres' | null;

export function FormulaireRecherche() {
  const t = useTranslations();
  const router = useRouter();
  const parametres = useSearchParams();

  const [destination, setDestination] = useState(parametres.get('city') ?? '');
  const [debut, setDebut] = useState(parametres.get('startDate') ?? '');
  const [fin, setFin] = useState(parametres.get('endDate') ?? '');
  const [voyageurs, setVoyageurs] = useState(parametres.get('capacity') ?? '');

  const [volet, setVolet] = useState<Volet>(null);
  const [recentes, setRecentes] = useState<string[]>([]);
  const [populaires, setPopulaires] = useState<string[]>([]);

  const rangee = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentes(lireDestinationsRecentes());

    getPublicHomes()
      .then((logements) => {
        const comptes = new Map<string, number>();

        for (const logement of logements) {
          if (!logement.city) continue;

          const nom = [logement.city, logement.country]
            .filter(Boolean)
            .join(', ');

          comptes.set(nom, (comptes.get(nom) ?? 0) + 1);
        }

        setPopulaires(
          Array.from(comptes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_POPULAIRES)
            .map(([nom]) => nom),
        );
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!volet) return;

    function auClicDehors(evenement: MouseEvent) {
      if (!rangee.current?.contains(evenement.target as Node)) setVolet(null);
    }

    document.addEventListener('mousedown', auClicDehors);

    return () => document.removeEventListener('mousedown', auClicDehors);
  }, [volet]);

  function choisirDestination(nom: string) {
    setDestination(nom);
    setVolet('quand');
  }

  function toutEffacer() {
    setDestination('');
    setDebut('');
    setFin('');
    setVoyageurs('');
    setVolet(null);
    router.push('/search');
  }

  function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const champs = new FormData(evenement.currentTarget);
    const suivants = new URLSearchParams();

    for (const [cle, valeur] of champs.entries()) {
      const texte = String(valeur).trim();

      if (texte) suivants.set(cle, texte);
    }

    const ville = destination.trim();

    if (ville) retenirDestination(ville);

    setVolet(null);

    const requete = suivants.toString();

    router.push(requete ? `/search?${requete}` : '/search');
  }

  const resumeQuand =
    debut && fin ? `${debut} — ${fin}` : debut || t('search.addDates');

  const suggestions = [
    ...recentes.map((nom) => ({ nom, detail: t('search.recentSearch') })),
    ...populaires
      .filter((nom) => !recentes.includes(nom))
      .map((nom) => ({ nom, detail: t('search.popularDestination') })),
  ];

  return (
    <form className={styles.formulaire} onSubmit={soumettre}>
      <div className={styles.rangee} ref={rangee}>
        <div className={styles.barre}>
          <div
            className={`${styles.segment} ${
              volet === 'ou' ? styles.segmentActif : ''
            }`.trim()}
          >
            <span className={styles.libelle}>{t('search.where')}</span>

            <input
              name="city"
              className={styles.saisie}
              value={destination}
              placeholder={t('search.destinationPlaceholder')}
              autoComplete="off"
              onFocus={() => setVolet('ou')}
              onChange={(evenement) => setDestination(evenement.target.value)}
            />

            {volet === 'ou' ? (
              <div className={styles.panneau}>
                <p className={styles.panneauTitre}>
                  {t('search.destinationSuggestions')}
                </p>

                {suggestions.map(({ nom, detail }) => (
                  <button
                    key={nom}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => choisirDestination(nom)}
                  >
                    <span className={styles.suggestionNom}>{nom}</span>
                    <span className={styles.suggestionDetail}>{detail}</span>
                  </button>
                ))}

                {suggestions.length === 0 ? (
                  <p className={styles.suggestionDetail}>
                    {t('search.noDestination')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div
            className={`${styles.segment} ${
              volet === 'quand' ? styles.segmentActif : ''
            }`.trim()}
          >
            <button
              type="button"
              className={styles.declencheur}
              onClick={() => setVolet(volet === 'quand' ? null : 'quand')}
            >
              <span className={styles.libelle}>{t('search.when')}</span>
              <span className={styles.valeur}>{resumeQuand}</span>
            </button>

            {volet === 'quand' ? (
              <div className={styles.panneau}>
                <label className={styles.champPanneau}>
                  <span className={styles.libelle}>{t('search.startDate')}</span>

                  <input
                    type="date"
                    value={debut}
                    onChange={(evenement) => setDebut(evenement.target.value)}
                  />
                </label>

                <label className={styles.champPanneau}>
                  <span className={styles.libelle}>{t('search.endDate')}</span>

                  <input
                    type="date"
                    value={fin}
                    min={debut || undefined}
                    onChange={(evenement) => setFin(evenement.target.value)}
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className={styles.segment}>
            <span className={styles.libelle}>{t('search.who')}</span>

            <input
              type="number"
              name="capacity"
              min={1}
              className={styles.saisie}
              value={voyageurs}
              placeholder={t('search.addTravelers')}
              onChange={(evenement) => setVoyageurs(evenement.target.value)}
            />
          </div>

          <button type="submit" className={styles.rechercher}>
            <Search size={16} />
            {t('common.search')}
          </button>
        </div>

        <div className={styles.porteFiltres}>
          <button
            type="button"
            className={styles.filtres}
            aria-expanded={volet === 'filtres'}
            onClick={() => setVolet(volet === 'filtres' ? null : 'filtres')}
          >
            <SlidersHorizontal size={16} />
            {t('search.filters.title')}
          </button>

          {volet === 'filtres' ? (
            <div className={styles.panneau}>
              <label className={styles.champPanneau}>
                <span className={styles.libelle}>
                  {t('search.filters.category')}
                </span>

                <select
                  name="category"
                  defaultValue={parametres.get('category') ?? ''}
                >
                  <option value="">{t('search.filters.any')}</option>

                  {CATEGORIES.map((categorie) => (
                    <option key={categorie} value={categorie}>
                      {t(`search.filters.categories.${categorie}`)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.champPanneau}>
                <span className={styles.libelle}>
                  {t('search.filters.bedrooms')}
                </span>

                <input
                  type="number"
                  name="bedrooms"
                  min={1}
                  defaultValue={parametres.get('bedrooms') ?? ''}
                />
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <input type="hidden" name="startDate" value={debut} />
      <input type="hidden" name="endDate" value={fin} />

      <button type="button" className={styles.toutEffacer} onClick={toutEffacer}>
        {t('search.clearAll')}
      </button>
    </form>
  );
}
