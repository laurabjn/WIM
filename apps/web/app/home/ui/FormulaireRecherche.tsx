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

type Volet = 'ou' | 'quand' | 'qui' | null;

export function FormulaireRecherche() {
  const t = useTranslations();
  const router = useRouter();
  const parametres = useSearchParams();

  const [destination, setDestination] = useState(parametres.get('city') ?? '');
  const [debut, setDebut] = useState(parametres.get('startDate') ?? '');
  const [fin, setFin] = useState(parametres.get('endDate') ?? '');
  const [voyageurs, setVoyageurs] = useState(parametres.get('capacity') ?? '');

  const [volet, setVolet] = useState<Volet>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [recentes, setRecentes] = useState<string[]>([]);
  const [populaires, setPopulaires] = useState<string[]>([]);

  const barre = useRef<HTMLDivElement>(null);

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
      if (!barre.current?.contains(evenement.target as Node)) setVolet(null);
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

  const resumeQui = voyageurs
    ? `${voyageurs} ${t('search.filters.travellers')}`
    : t('search.addTravelers');

  return (
    <form className={styles.formulaire} onSubmit={soumettre}>
      <div className={styles.rangee}>
        <div className={styles.barre} ref={barre}>
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
              <div className={styles.suggestions}>
                <p className={styles.suggestionsTitre}>
                  {t('search.destinationSuggestions')}
                </p>

                {recentes.map((nom) => (
                  <button
                    key={`recente-${nom}`}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => choisirDestination(nom)}
                  >
                    <span className={styles.suggestionNom}>{nom}</span>

                    <span className={styles.suggestionDetail}>
                      {t('search.recentSearch')}
                    </span>
                  </button>
                ))}

                {populaires
                  .filter((nom) => !recentes.includes(nom))
                  .map((nom) => (
                    <button
                      key={`populaire-${nom}`}
                      type="button"
                      className={styles.suggestion}
                      onClick={() => choisirDestination(nom)}
                    >
                      <span className={styles.suggestionNom}>{nom}</span>

                      <span className={styles.suggestionDetail}>
                        {t('search.popularDestination')}
                      </span>
                    </button>
                  ))}

                {recentes.length === 0 && populaires.length === 0 ? (
                  <p className={styles.suggestionDetail}>
                    {t('search.noDestination')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className={`${styles.segment} ${styles.segmentBouton} ${
              volet === 'quand' ? styles.segmentActif : ''
            }`.trim()}
            onClick={() => setVolet(volet === 'quand' ? null : 'quand')}
          >
            <span className={styles.libelle}>{t('search.when')}</span>
            <span className={styles.valeur}>{resumeQuand}</span>
          </button>

          <button
            type="button"
            className={`${styles.segment} ${styles.segmentBouton} ${
              volet === 'qui' ? styles.segmentActif : ''
            }`.trim()}
            onClick={() => setVolet(volet === 'qui' ? null : 'qui')}
          >
            <span className={styles.libelle}>{t('search.who')}</span>
            <span className={styles.valeur}>{resumeQui}</span>
          </button>

          <button type="submit" className={styles.rechercher}>
            <Search size={16} />
            {t('common.search')}
          </button>
        </div>

        <button
          type="button"
          className={styles.filtres}
          onClick={() => setFiltresOuverts((ouvert) => !ouvert)}
        >
          <SlidersHorizontal size={16} />
          {t('search.filters.title')}
        </button>
      </div>

      {volet === 'quand' ? (
        <div className={styles.volet}>
          <label className={styles.champVolet}>
            <span className={styles.libelle}>{t('search.startDate')}</span>

            <input
              type="date"
              name="startDate"
              value={debut}
              onChange={(evenement) => setDebut(evenement.target.value)}
            />
          </label>

          <label className={styles.champVolet}>
            <span className={styles.libelle}>{t('search.endDate')}</span>

            <input
              type="date"
              name="endDate"
              value={fin}
              min={debut || undefined}
              onChange={(evenement) => setFin(evenement.target.value)}
            />
          </label>
        </div>
      ) : (
        <>
          <input type="hidden" name="startDate" value={debut} />
          <input type="hidden" name="endDate" value={fin} />
        </>
      )}

      {volet === 'qui' ? (
        <div className={styles.volet}>
          <label className={styles.champVolet}>
            <span className={styles.libelle}>
              {t('search.filters.travellers')}
            </span>

            <input
              type="number"
              name="capacity"
              min={1}
              value={voyageurs}
              onChange={(evenement) => setVoyageurs(evenement.target.value)}
            />
          </label>
        </div>
      ) : (
        <input type="hidden" name="capacity" value={voyageurs} />
      )}

      {filtresOuverts ? (
        <div className={styles.volet}>
          <label className={styles.champVolet}>
            <span className={styles.libelle}>{t('search.filters.category')}</span>

            <select name="category" defaultValue={parametres.get('category') ?? ''}>
              <option value="">{t('search.filters.any')}</option>

              {CATEGORIES.map((categorie) => (
                <option key={categorie} value={categorie}>
                  {t(`search.filters.categories.${categorie}`)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.champVolet}>
            <span className={styles.libelle}>{t('search.filters.bedrooms')}</span>

            <input
              type="number"
              name="bedrooms"
              min={1}
              defaultValue={parametres.get('bedrooms') ?? ''}
            />
          </label>
        </div>
      ) : null}

      <button type="button" className={styles.toutEffacer} onClick={toutEffacer}>
        {t('search.clearAll')}
      </button>
    </form>
  );
}
