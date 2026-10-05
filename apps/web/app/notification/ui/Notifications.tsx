'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationVue,
} from 'app/notification/infrastructure/notification.api';

import styles from './Notifications.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

function destination(notification: NotificationVue) {
  const chatId = notification.data?.chatId;

  if (typeof chatId === 'string' && chatId) return `/messages?chat=${chatId}`;

  const homeId = notification.data?.homeId;

  if (typeof homeId === 'string' && homeId) return `/homes/${homeId}`;

  return null;
}

export function Notifications() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [liste, setListe] = useState<NotificationVue[]>([]);
  const [curseur, setCurseur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);

  const quand = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
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

    setToken(session.accessToken);

    getNotifications(session.accessToken)
      .then((page) => {
        if (!actif) return;

        setListe(page.notifications);
        setCurseur(page.curseurSuivant);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

  async function chargerLaSuite() {
    if (!token || !curseur || occupe) return;

    setOccupe(true);

    try {
      const page = await getNotifications(token, curseur);

      setListe((courante) => [...courante, ...page.notifications]);
      setCurseur(page.curseurSuivant);
    } catch {
      setCurseur(null);
    } finally {
      setOccupe(false);
    }
  }

  async function toutLire() {
    if (!token || occupe) return;

    setOccupe(true);

    try {
      await markAllNotificationsRead(token);
      setListe((courante) =>
        courante.map((notification) => ({ ...notification, lu: true })),
      );
    } catch {
      setOccupe(false);

      return;
    }

    setOccupe(false);
  }

  async function ouvrir(notification: NotificationVue) {
    const vers = destination(notification);

    if (token && !notification.lu) {
      setListe((courante) =>
        courante.map((candidate) =>
          candidate.id === notification.id
            ? { ...candidate, lu: true }
            : candidate,
        ),
      );

      markNotificationRead(token, notification.id).catch(() => undefined);
    }

    if (vers) router.push(vers);
  }

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('common.loading')}</p>;
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

  if (etat === 'erreur') {
    return <p className={styles.etat}>{t('common.genericError')}</p>;
  }

  if (liste.length === 0) {
    return (
      <div className={styles.etat}>
        <p className={styles.videTitre}>{t('notifications.empty')}</p>
        <p>{t('notifications.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.barre}>
        <button
          type="button"
          className={styles.boutonClair}
          disabled={occupe || liste.every((notification) => notification.lu)}
          onClick={toutLire}
        >
          {t('notifications.readAll')}
        </button>
      </div>

      <ul className={styles.liste}>
        {liste.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              className={`${styles.entree} ${
                notification.lu ? '' : styles.entreeNonLue
              }`.trim()}
              onClick={() => ouvrir(notification)}
            >
              <span className={styles.textes}>
                <span className={styles.entreeTitre}>
                  {notification.title}
                </span>

                <span className={styles.entreeCorps}>{notification.body}</span>
              </span>

              <span className={styles.date}>
                {quand.format(new Date(notification.createdAt))}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {curseur ? (
        <button
          type="button"
          className={styles.boutonClair}
          disabled={occupe}
          onClick={chargerLaSuite}
        >
          {t('common.seeMore')}
        </button>
      ) : null}
    </div>
  );
}
