'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Home, UserProfile } from '@wim/shared';

import {
  clearSession,
  getSession,
} from 'app/auth/infrastructure/authStorage';
import { getMyHomes } from 'app/home/infrastructure/home.api';
import { HomeDetailsCard } from 'app/home/ui/components/HomeDetailsCard';
import { getMyProfile } from 'app/profile/infrastructure/profile.api';

import styles from './MonCompte.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

const RACCOURCIS = [
  { href: '/favorites', cle: 'profile.favorites' },
  { href: '/account/settings', cle: 'profile.parameters' },
  { href: '/subscription', cle: 'profile.settings.subscription' },
  { href: '/account/support', cle: 'profile.help' },
] as const;

export function MonCompte() {
  const t = useTranslations();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [logements, setLogements] = useState<Home[]>([]);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    Promise.all([
      getMyProfile(session.accessToken),
      getMyHomes(session.accessToken).catch(() => []),
    ])
      .then(([mien, miens]) => {
        if (!actif) return;

        setProfil(mien);
        setLogements(miens);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

  function seDeconnecter() {
    clearSession();
    router.push('/login');
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

  const nom = [profil.firstName, profil.lastName].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <section className={styles.carte}>
        <span className={styles.avatar}>
          {profil.avatarUrl ? (
            <Image
              src={profil.avatarUrl}
              alt={nom}
              fill
              className={styles.avatarImage}
            />
          ) : (
            (profil.firstName?.[0] ?? '?').toUpperCase()
          )}
        </span>

        <div className={styles.identite}>
          <h2 className={styles.nom}>{nom}</h2>

          <p className={styles.email}>{profil.email}</p>

          <p className={styles.chiffres}>
            {profil.homesCount ?? logements.length} {t('profile.homes')} ·{' '}
            {profil.exchangesCount ?? 0} {t('profile.exchanges')} ·{' '}
            {(profil.averageRating ?? 0).toFixed(1)} {t('profile.rate')}
          </p>

          <p className={styles.identiteEtat}>
            {profil.identityVerified
              ? t('profile.identityVerified')
              : t('common.notVerified')}
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/account/edit" className={styles.boutonSombre}>
            {t('profile.editProfile.title')}
          </Link>

          <Link
            href={`/profile?userId=${profil.id}`}
            className={styles.boutonClair}
          >
            {t('common.seeMore')}
          </Link>
        </div>
      </section>

      <section className={styles.bloc}>
        <div className={styles.blocEntete}>
          <h2 className={styles.blocTitre}>{t('profile.homes')}</h2>
        </div>

        {logements.length === 0 ? (
          <p className={styles.vide}>{t('profile.noHomes')}</p>
        ) : (
          <div className={styles.grille}>
            {logements.map((logement) => (
              <HomeDetailsCard key={logement.id} home={logement} />
            ))}
          </div>
        )}
      </section>

      <nav className={styles.liens}>
        {RACCOURCIS.map((raccourci) => (
          <Link
            key={raccourci.href}
            href={raccourci.href}
            className={styles.ligne}
          >
            {t(raccourci.cle)}
          </Link>
        ))}

        <button
          type="button"
          className={styles.ligneDanger}
          onClick={seDeconnecter}
        >
          {t('profile.logout')}
        </button>
      </nav>
    </div>
  );
}
