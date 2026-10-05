'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { getSession } from 'app/auth/infrastructure/authStorage';
import { getMyMatches, type MatchItem } from 'app/chat/infrastructure/chat.api';

import styles from './Matchs.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

export function Matchs() {
  const t = useTranslations();
  const locale = useLocale();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [matchs, setMatchs] = useState<MatchItem[]>([]);

  const dates = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    getMyMatches(session.accessToken)
      .then((liste) => {
        if (!actif) return;

        setMatchs(liste);
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
    return <p className={styles.etat}>{t('chat.loadError')}</p>;
  }

  if (matchs.length === 0) {
    return (
      <div className={styles.etat}>
        <p className={styles.videTitre}>{t('chat.empty')}</p>
        <p>{t('chat.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <ul className={styles.liste}>
      {matchs.map((match) => {
        const nom = [match.user.firstName, match.user.lastName]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={match.id}>
            <Link
              href={
                match.chatId
                  ? `/messages?chat=${match.chatId}`
                  : `/profile?userId=${match.user.id}`
              }
              className={styles.entree}
            >
              <span className={styles.avatar}>
                {match.user.avatarUrl ? (
                  <Image
                    src={match.user.avatarUrl}
                    alt={nom}
                    fill
                    className={styles.avatarImage}
                  />
                ) : (
                  (match.user.firstName?.[0] ?? '?').toUpperCase()
                )}
              </span>

              <span className={styles.textes}>
                <span className={styles.nom}>{nom}</span>

                <span className={styles.detail}>
                  {match.user.country ?? ''}
                </span>
              </span>

              <span className={styles.date}>
                {dates.format(new Date(match.createdAt))}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
