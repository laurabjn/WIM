'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';
import {
  CONTINENTS,
  ENVIRONMENTS,
  ESSENTIAL_AMENITIES,
  HOME_TYPES,
  REGION_DESTINATIONS,
  SEASONS,
  STAY_DURATIONS,
  type UserProfile,
} from '@wim/shared';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  getMyProfile,
  updateMyProfile,
} from 'app/profile/infrastructure/profile.api';

import styles from './Preferences.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

function basculer(liste: string[], valeur: string) {
  return liste.includes(valeur)
    ? liste.filter((element) => element !== valeur)
    : [...liste, valeur];
}

export function Preferences() {
  const t = useTranslations();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [profil, setProfil] = useState<UserProfile | null>(null);

  const [continents, setContinents] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<Record<string, string[]>>(
    {},
  );
  const [types, setTypes] = useState<string[]>([]);
  const [duree, setDuree] = useState('');
  const [saisons, setSaisons] = useState<string[]>([]);
  const [equipements, setEquipements] = useState<string[]>([]);
  const [environnements, setEnvironnements] = useState<string[]>([]);
  const [voyageurs, setVoyageurs] = useState('');
  const [enfants, setEnfants] = useState(false);
  const [animaux, setAnimaux] = useState(false);

  const [envoi, setEnvoi] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function remplir(mien: UserProfile) {
    const voulu = mien.travelPreferences ?? {
      preferredCountries: [],
      preferredHomeTypes: [],
      minCapacity: null,
      maxCapacity: null,
      carExchangeAccepted: null,
      flexibleDates: null,
    };

    setProfil(mien);
    setContinents(voulu.preferredContinents ?? []);
    setDestinations(voulu.preferredDestinationsByRegion ?? {});
    setTypes(voulu.preferredHomeTypes ?? []);
    setDuree(voulu.stayDuration ?? '');
    setSaisons(voulu.preferredSeasons ?? []);
    setEquipements(voulu.essentialAmenities ?? []);
    setEnvironnements(voulu.preferredEnvironments ?? []);
    setVoyageurs(
      voulu.travelersCount ? String(voulu.travelersCount) : '',
    );
    setEnfants(voulu.travelingWithChildren === true);
    setAnimaux(voulu.petsAccepted === true);
  }

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    setToken(session.accessToken);

    getMyProfile(session.accessToken)
      .then((mien) => {
        if (!actif) return;

        remplir(mien);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

  function basculerLeContinent(continent: string) {
    const retire = continents.includes(continent);

    setContinents((liste) => basculer(liste, continent));

    if (!retire) return;

    setDestinations((courantes) => {
      const suivantes = { ...courantes };

      delete suivantes[continent];

      return suivantes;
    });
  }

  function basculerLaDestination(continent: string, destination: string) {
    setDestinations((courantes) => ({
      ...courantes,
      [continent]: basculer(courantes[continent] ?? [], destination),
    }));
  }

  async function enregistrer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    if (!token || !profil || envoi) return;

    setEnvoi(true);
    setErreur(null);
    setEnregistre(false);

    try {
      remplir(
        await updateMyProfile(token, {
          travelPreferences: {
            ...profil.travelPreferences,
            preferredContinents: continents,
            preferredDestinationsByRegion: destinations,
            preferredHomeTypes: types,
            stayDuration: duree || null,
            preferredSeasons: saisons,
            essentialAmenities: equipements,
            preferredEnvironments: environnements,
            travelersCount: voyageurs ? Number(voyageurs) : null,
            travelingWithChildren: enfants,
            petsAccepted: animaux,
          },
        }),
      );

      setEnregistre(true);
    } catch {
      setErreur(t('profile.settings.saveError'));
    } finally {
      setEnvoi(false);
    }
  }

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('profile.loading')}</p>;
  }

  if (etat === 'anonyme') {
    return (
      <div className={styles.etat}>
        <p>{t('common.signInRequired')}</p>

        <Link href="/login" className={styles.boutonSombre}>
          {t('common.signIn')}
        </Link>
      </div>
    );
  }

  if (etat === 'erreur' || !profil) {
    return <p className={styles.etat}>{t('profile.profileNotFound')}</p>;
  }

  return (
    <form className={styles.formulaire} onSubmit={enregistrer}>
      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.preferencesTravel.preferredDestinations')}
        </h2>

        <p className={styles.aide}>{t('profile.preferencesTravel.subtitle')}</p>

        <div className={styles.puces}>
          {CONTINENTS.map((continent) => (
            <button
              key={continent}
              type="button"
              className={`${styles.puce} ${
                continents.includes(continent) ? styles.puceActive : ''
              }`.trim()}
              onClick={() => basculerLeContinent(continent)}
            >
              {t(`profile.continent.${continent}`)}
            </button>
          ))}
        </div>

        {continents.map((continent) => (
          <div key={continent} className={styles.sousBloc}>
            <p className={styles.sousTitre}>
              {t(`profile.continent.${continent}`)}
            </p>

            <div className={styles.puces}>
              {(REGION_DESTINATIONS[continent] ?? []).map((destination) => (
                <button
                  key={destination}
                  type="button"
                  className={`${styles.puceFine} ${
                    (destinations[continent] ?? []).includes(destination)
                      ? styles.puceActive
                      : ''
                  }`.trim()}
                  onClick={() => basculerLaDestination(continent, destination)}
                >
                  {t(`profile.regionDestinations.${continent}.${destination}`)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('auth.register.housingType')}</h2>

        <div className={styles.puces}>
          {HOME_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.puce} ${
                types.includes(type) ? styles.puceActive : ''
              }`.trim()}
              onClick={() => setTypes((liste) => basculer(liste, type))}
            >
              {t(`profile.homeType.${type}`)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.preferencesTravel.lengthOfStay')}
        </h2>

        <div className={styles.puces}>
          {STAY_DURATIONS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={`${styles.puce} ${
                duree === candidate ? styles.puceActive : ''
              }`.trim()}
              onClick={() => setDuree(duree === candidate ? '' : candidate)}
            >
              {t(`profile.stayDuration.${candidate}`)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.preferencesTravel.timeOfYear')}
        </h2>

        <div className={styles.puces}>
          {SEASONS.map((saison) => (
            <button
              key={saison}
              type="button"
              className={`${styles.puce} ${
                saisons.includes(saison) ? styles.puceActive : ''
              }`.trim()}
              onClick={() => setSaisons((liste) => basculer(liste, saison))}
            >
              {t(`profile.season.${saison}`)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.preferencesTravel.equipments')}
        </h2>

        <p className={styles.aide}>
          {t('profile.preferencesTravel.equipmentsSubtitle')}
        </p>

        <div className={styles.puces}>
          {ESSENTIAL_AMENITIES.map((equipement) => (
            <button
              key={equipement}
              type="button"
              className={`${styles.puce} ${
                equipements.includes(equipement) ? styles.puceActive : ''
              }`.trim()}
              onClick={() =>
                setEquipements((liste) => basculer(liste, equipement))
              }
            >
              {t(`profile.essentialAmenities.${equipement}`)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.preferencesTravel.typeOfEnvironment')}
        </h2>

        <div className={styles.puces}>
          {ENVIRONMENTS.map((environnement) => (
            <button
              key={environnement}
              type="button"
              className={`${styles.puce} ${
                environnements.includes(environnement) ? styles.puceActive : ''
              }`.trim()}
              onClick={() =>
                setEnvironnements((liste) => basculer(liste, environnement))
              }
            >
              {t(`profile.environments.${environnement}`)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.preferencesTravel.numberOfTravelers')}
        </h2>

        <label className={styles.champ}>
          <input
            type="number"
            min={1}
            value={voyageurs}
            onChange={(evenement) => setVoyageurs(evenement.target.value)}
          />
        </label>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.preferencesTravel.additionalOptions')}
        </h2>

        <label className={styles.interrupteur}>
          <input
            type="checkbox"
            checked={enfants}
            onChange={(evenement) => setEnfants(evenement.target.checked)}
          />

          <span>{t('profile.preferencesTravel.travelingWithChildren')}</span>
        </label>

        <label className={styles.interrupteur}>
          <input
            type="checkbox"
            checked={animaux}
            onChange={(evenement) => setAnimaux(evenement.target.checked)}
          />

          <span>{t('profile.preferencesTravel.petsAccepted')}</span>
        </label>
      </section>

      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      {enregistre ? (
        <p className={styles.succes}>
          {t('profile.editProfile.savedMessage')}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Link href="/account" className={styles.boutonClair}>
          {t('common.cancel')}
        </Link>

        <button type="submit" className={styles.boutonSombre} disabled={envoi}>
          {envoi
            ? t('profile.preferencesTravel.savingInProgress')
            : t('profile.preferencesTravel.save')}
        </button>
      </div>
    </form>
  );
}
