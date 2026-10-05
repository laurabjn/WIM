'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Home } from '@wim/shared';

import { getSession } from 'app/auth/infrastructure/authStorage';
import { listFavoriteHomes } from 'app/home/infrastructure/home.api';
import { HomeDetailsCard } from 'app/home/ui/components/HomeDetailsCard';

import styles from './Favoris.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

export function Favoris() {
  const t = useTranslations();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [logements, setLogements] = useState<Home[]>([]);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    listFavoriteHomes(session.accessToken)
      .then((liste) => {
        if (!actif) return;

        setLogements(liste);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('common.loading')}</p>;
  }

  if (etat === 'anonyme') {
    return (
      <div className={styles.etat}>
        <p>{t('common.signInRequired')}</p>

        <Link href="/login" className={styles.bouton}>
          {t('common.signIn')}
        </Link>
      </div>
    );
  }

  if (etat === 'erreur') {
    return <p className={styles.etat}>{t('common.genericError')}</p>;
  }

  if (logements.length === 0) {
    return (
      <div className={styles.etat}>
        <p>{t('profile.noFavorites')}</p>

        <Link href="/search" className={styles.bouton}>
          {t('common.search')}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.grille}>
      {logements.map((logement) => (
        <HomeDetailsCard key={logement.id} home={logement} initialFavorite />
      ))}
    </div>
  );
}
