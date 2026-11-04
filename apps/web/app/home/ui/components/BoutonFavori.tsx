'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  addFavoriteHome,
  listFavoriteHomes,
  removeFavoriteHome,
} from 'app/home/infrastructure/home.api';

import styles from './BoutonRond.module.css';

type Props = {
  homeId: string;
  ownerId: string;
};

export function BoutonFavori({ homeId, ownerId }: Props) {
  const t = useTranslations('home');

  const [jeton, setJeton] = useState<string | null>(null);
  const [favori, setFavori] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session || session.user.id === ownerId) return;

    let actif = true;

    setJeton(session.accessToken);

    listFavoriteHomes(session.accessToken)
      .catch(() => [])
      .then((liste) => {
        if (actif) setFavori(liste.some((un) => un.id === homeId));
      });

    return () => {
      actif = false;
    };
  }, [homeId, ownerId]);

  async function basculer() {
    if (!jeton || envoi) return;

    const suivant = !favori;

    setFavori(suivant);
    setEnvoi(true);

    try {
      if (suivant) {
        await addFavoriteHome(jeton, homeId);
      } else {
        await removeFavoriteHome(jeton, homeId);
      }
    } catch {
      setFavori(!suivant);
    } finally {
      setEnvoi(false);
    }
  }

  if (!jeton) return null;

  const libelle = favori ? t('removeFromFavorites') : t('addToFavorites');

  return (
    <button
      type="button"
      className={`${styles.rond} ${favori ? styles.rondActif : ''}`}
      onClick={basculer}
      disabled={envoi}
      title={libelle}
      aria-label={libelle}
      aria-pressed={favori}
    >
      <Star size={18} fill={favori ? 'currentColor' : 'none'} />
    </button>
  );
}
