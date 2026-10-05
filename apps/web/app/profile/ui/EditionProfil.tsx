'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ENVIRONMENTS,
  LANGUAGES_OPTIONS,
  type SupportedLocale,
  type UserProfile,
} from '@wim/shared';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from 'app/profile/infrastructure/profile.api';

import styles from './EditionProfil.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

export function EditionProfil() {
  const t = useTranslations();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [profil, setProfil] = useState<UserProfile | null>(null);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [bio, setBio] = useState('');
  const [pays, setPays] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [telephone, setTelephone] = useState('');
  const [naissance, setNaissance] = useState('');
  const [langues, setLangues] = useState<string[]>([]);
  const [environnements, setEnvironnements] = useState<string[]>([]);
  const [locale, setLocale] = useState<SupportedLocale>('fr');

  const [envoi, setEnvoi] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const fichier = useRef<HTMLInputElement>(null);

  function remplir(mien: UserProfile) {
    setProfil(mien);
    setPrenom(mien.firstName ?? '');
    setNom(mien.lastName ?? '');
    setBio(mien.bio ?? '');
    setPays(mien.country ?? '');
    setNationalite(mien.nationality ?? '');
    setTelephone(mien.phone ?? '');
    setNaissance(mien.birthDate ? mien.birthDate.slice(0, 10) : '');
    setLangues(mien.languages ?? []);
    setEnvironnements(mien.travelPreferences?.preferredEnvironments ?? []);
    setLocale(mien.preferredLocale ?? 'fr');
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

  function basculer(
    valeur: string,
    liste: string[],
    poser: (suivante: string[]) => void,
  ) {
    poser(
      liste.includes(valeur)
        ? liste.filter((element) => element !== valeur)
        : [...liste, valeur],
    );
  }

  async function changerLaPhoto(choisi: File | undefined) {
    if (!token || !choisi) return;

    setErreur(null);

    try {
      remplir(await uploadMyAvatar(token, choisi));
    } catch {
      setErreur(t('profile.editProfile.errorMessage'));
    }
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
          firstName: prenom.trim(),
          lastName: nom.trim(),
          bio: bio.trim() || null,
          country: pays.trim() || null,
          nationality: nationalite.trim() || null,
          phone: telephone.trim() || null,
          birthDate: naissance || null,
          languages: langues,
          preferredLocale: locale,
          travelPreferences: {
            ...profil.travelPreferences,
            preferredEnvironments: environnements,
          },
        }),
      );

      setEnregistre(true);
    } catch {
      setErreur(t('profile.editProfile.errorMessage'));
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
      <section className={styles.photo}>
        <span className={styles.avatar}>
          {profil.avatarUrl ? (
            <Image
              src={profil.avatarUrl}
              alt={prenom}
              fill
              className={styles.avatarImage}
            />
          ) : (
            (prenom[0] ?? '?').toUpperCase()
          )}
        </span>

        <input
          ref={fichier}
          className={styles.cache}
          type="file"
          accept="image/*"
          onChange={(evenement) =>
            changerLaPhoto(evenement.target.files?.[0])
          }
        />

        <button
          type="button"
          className={styles.boutonClair}
          onClick={() => fichier.current?.click()}
        >
          {t('profile.editProfile.changePhoto')}
        </button>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.editProfile.presentation')}
        </h2>

        <div className={styles.lignes}>
          <label className={styles.champ}>
            <span className={styles.libelle}>
              {t('auth.register.firstName')}
            </span>

            <input
              value={prenom}
              onChange={(evenement) => setPrenom(evenement.target.value)}
              required
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>
              {t('auth.register.lastName')}
            </span>

            <input
              value={nom}
              onChange={(evenement) => setNom(evenement.target.value)}
              required
            />
          </label>
        </div>

        <label className={styles.champ}>
          <span className={styles.libelle}>
            {t('profile.editProfile.bioPlaceholder')}
          </span>

          <textarea
            value={bio}
            rows={4}
            onChange={(evenement) => setBio(evenement.target.value)}
          />
        </label>

        <div className={styles.lignes}>
          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.country')}</span>

            <input
              value={pays}
              onChange={(evenement) => setPays(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('profile.nationality')}</span>

            <input
              value={nationalite}
              onChange={(evenement) => setNationalite(evenement.target.value)}
            />
          </label>
        </div>

        <div className={styles.lignes}>
          <label className={styles.champ}>
            <span className={styles.libelle}>{t('profile.phone')}</span>

            <input
              type="tel"
              value={telephone}
              onChange={(evenement) => setTelephone(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('profile.birthDate')}</span>

            <input
              type="date"
              value={naissance}
              onChange={(evenement) => setNaissance(evenement.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.editProfile.languages')}
        </h2>

        <div className={styles.puces}>
          {LANGUAGES_OPTIONS.map((langue) => (
            <button
              key={langue}
              type="button"
              className={`${styles.puce} ${
                langues.includes(langue) ? styles.puceActive : ''
              }`.trim()}
              onClick={() => basculer(langue, langues, setLangues)}
            >
              {t(`profile.language.${langue}`)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.editProfile.favoriteEnvironment')}
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
                basculer(environnement, environnements, setEnvironnements)
              }
            >
              {t(`profile.environments.${environnement}`)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('profile.settings.language')}</h2>

        <label className={styles.champ}>
          <select
            value={locale}
            onChange={(evenement) =>
              setLocale(evenement.target.value as SupportedLocale)
            }
          >
            <option value="fr">{t('profile.language.french')}</option>
            <option value="en">{t('profile.language.english')}</option>
          </select>
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

        <button
          type="submit"
          className={styles.boutonSombre}
          disabled={envoi}
        >
          {t('common.save')}
        </button>
      </div>
    </form>
  );
}
