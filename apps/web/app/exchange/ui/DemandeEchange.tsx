'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';
import type { Home } from '@wim/shared';

import { getSession } from 'app/auth/infrastructure/authStorage';
import { requestExchange } from 'app/exchange/infrastructure/exchange.api';
import { getMyHomes } from 'app/home/infrastructure/home.api';

import styles from './DemandeEchange.module.css';

type Props = {
  homeId: string;
  ownerId: string;
};

type Etat = 'chargement' | 'anonyme' | 'mien' | 'prete';

export function DemandeEchange({ homeId, ownerId }: Props) {
  const t = useTranslations();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [miens, setMiens] = useState<Home[]>([]);

  const [ouvert, setOuvert] = useState(false);
  const [offert, setOffert] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [voyageurs, setVoyageurs] = useState('');
  const [message, setMessage] = useState('');

  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    if (session.user.id === ownerId) {
      setEtat('mien');

      return;
    }

    let actif = true;

    setToken(session.accessToken);

    getMyHomes(session.accessToken)
      .catch(() => [])
      .then((liste) => {
        if (!actif) return;

        setMiens(liste);
        setEtat('prete');
      });

    return () => {
      actif = false;
    };
  }, [ownerId]);

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const propre = message.trim();

    if (!token || !propre || envoi) return;

    setEnvoi(true);
    setErreur(null);

    try {
      const { chatId } = await requestExchange(token, {
        homeId,
        guestHomeId: offert || undefined,
        message: propre,
        startDate: debut || undefined,
        endDate: fin || undefined,
        travelersCount: voyageurs ? Number(voyageurs) : undefined,
      });

      router.push(chatId ? `/messages?chat=${chatId}` : '/messages');
    } catch (souci) {
      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
      setEnvoi(false);
    }
  }

  if (etat === 'mien') {
    return (
      <aside className={styles.appel}>
        <Link href="/account" className={styles.boutonSombre}>
          {t('common.account')}
        </Link>
      </aside>
    );
  }

  if (etat === 'anonyme') {
    return (
      <aside className={styles.appel}>
        <p className={styles.appelTexte}>{t('home.shareCtaText')}</p>

        <Link href="/register" className={styles.boutonSombre}>
          {t('home.shareCtaButton')}
        </Link>
      </aside>
    );
  }

  if (etat === 'chargement') {
    return <aside className={styles.appel}>{t('common.loading')}</aside>;
  }

  if (!ouvert) {
    return (
      <aside className={styles.appel}>
        <button
          type="button"
          className={styles.boutonSombre}
          onClick={() => {
            setMessage(t('contact.defaultMessageContent'));
            setOuvert(true);
          }}
        >
          {t('common.contact')}
        </button>
      </aside>
    );
  }

  return (
    <aside className={styles.appel}>
      <h2 className={styles.titre}>{t('contact.title')}</h2>

      <form className={styles.formulaire} onSubmit={envoyer}>
        <div className={styles.lignes}>
          <label className={styles.champ}>
            <span className={styles.libelle}>{t('search.startDate')}</span>

            <input
              type="date"
              value={debut}
              onChange={(evenement) => setDebut(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('search.endDate')}</span>

            <input
              type="date"
              value={fin}
              min={debut || undefined}
              onChange={(evenement) => setFin(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('search.travelers')}</span>

            <input
              type="number"
              min={1}
              value={voyageurs}
              onChange={(evenement) => setVoyageurs(evenement.target.value)}
            />
          </label>
        </div>

        {miens.length > 0 ? (
          <label className={styles.champ}>
            <span className={styles.libelle}>{t('contact.offeredHome')}</span>

            <select
              value={offert}
              onChange={(evenement) => setOffert(evenement.target.value)}
            >
              <option value="">{t('common.notProvided')}</option>

              {miens.map((logement) => (
                <option key={logement.id} value={logement.id}>
                  {logement.title}
                </option>
              ))}
            </select>

            <span className={styles.aide}>{t('contact.offeredHomeHint')}</span>
          </label>
        ) : null}

        <label className={styles.champ}>
          <span className={styles.libelle}>{t('contact.message')}</span>

          <textarea
            value={message}
            rows={6}
            placeholder={t('contact.messagePlaceholder')}
            onChange={(evenement) => setMessage(evenement.target.value)}
          />
        </label>

        {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.boutonClair}
            onClick={() => setOuvert(false)}
          >
            {t('common.cancel')}
          </button>

          <button
            type="submit"
            className={styles.boutonSombre}
            disabled={envoi || message.trim().length === 0}
          >
            {t('contact.send')}
          </button>
        </div>
      </form>
    </aside>
  );
}
