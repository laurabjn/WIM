'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { PendingExchange } from '@wim/shared';

import {
  ErreurApi,
  cancelExchange,
  fetchGuestHomes,
  getChatExchange,
  respondToExchange,
  type LogementCandidat,
} from 'app/exchange/infrastructure/exchange.api';

import styles from './BandeauEchange.module.css';

type Props = {
  token: string;
  chatId: string;
};

export function BandeauEchange({ token, chatId }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  const [echange, setEchange] = useState<PendingExchange | null>(null);
  const [candidats, setCandidats] = useState<LogementCandidat[]>([]);
  const [choisi, setChoisi] = useState('');

  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [identiteRequise, setIdentiteRequise] = useState(false);
  const [confirmeAnnulation, setConfirmeAnnulation] = useState(false);

  const dates = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  );

  useEffect(() => {
    let actif = true;

    setEchange(null);
    setCandidats([]);
    setChoisi('');
    setErreur(null);
    setIdentiteRequise(false);
    setConfirmeAnnulation(false);

    getChatExchange(token, chatId)
      .then((trouve) => {
        if (!actif) return;

        setEchange(trouve);

        if (!trouve || trouve.status !== 'PENDING' || !trouve.isHost) return;

        return fetchGuestHomes(token, trouve.id).then((liste) => {
          if (!actif) return;

          const seul = liste.length === 1 ? liste[0] : undefined;

          setCandidats(liste);
          setChoisi(seul ? seul.id : '');
        });
      })
      .catch(() => undefined);

    return () => {
      actif = false;
    };
  }, [token, chatId]);

  async function repondre(reponse: 'ACCEPT' | 'DECLINE') {
    if (!echange || occupe) return;

    setOccupe(true);
    setErreur(null);
    setIdentiteRequise(false);

    try {
      setEchange(
        await respondToExchange(
          token,
          echange.id,
          reponse,
          choisi || undefined,
        ),
      );
    } catch (souci) {
      if (souci instanceof ErreurApi && souci.code === 'IDENTITY_NOT_VERIFIED') {
        setIdentiteRequise(true);
      }

      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
    } finally {
      setOccupe(false);
    }
  }

  async function annuler() {
    if (!echange || occupe) return;

    setOccupe(true);
    setErreur(null);

    try {
      setEchange(await cancelExchange(token, echange.id));
      setConfirmeAnnulation(false);
    } catch (souci) {
      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
    } finally {
      setOccupe(false);
    }
  }

  if (!echange) return null;

  const periode = `${t('chat.exchangeFrom')} ${dates.format(
    new Date(echange.startDate),
  )} ${t('chat.exchangeTo')} ${dates.format(new Date(echange.endDate))}`;

  const enAttente = echange.status === 'PENDING';
  const confirme =
    echange.status === 'CURRENT' || echange.status === 'FUTURE';

  return (
    <div className={styles.bandeau}>
      <div className={styles.entete}>
        <span className={styles.etat}>
          {enAttente
            ? t('chat.exchangePending')
            : confirme
              ? t('chat.exchangeConfirmed')
              : echange.status}
        </span>

        <span className={styles.periode}>{periode}</span>
      </div>

      <div className={styles.logements}>
        <span className={styles.logement}>
          <span className={styles.logementRole}>
            {echange.isHost
              ? t('chat.bannerTheyCome')
              : t('chat.bannerYouGo')}
          </span>

          <Link href={`/homes/${echange.homeId}`} className={styles.lien}>
            {echange.homeTitle}
          </Link>
        </span>

        <span className={styles.logement}>
          <span className={styles.logementRole}>
            {echange.isHost ? t('chat.bannerYouGo') : t('chat.bannerTheyCome')}
          </span>

          {echange.guestHomeId && echange.guestHomeTitle ? (
            <Link
              href={`/homes/${echange.guestHomeId}`}
              className={styles.lien}
            >
              {echange.guestHomeTitle}
            </Link>
          ) : (
            <span className={styles.vide}>{t('chat.bannerNoHome')}</span>
          )}
        </span>
      </div>

      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      {identiteRequise ? (
        <Link href="/account/settings" className={styles.boutonClair}>
          {t('auth.identity.gateAction')}
        </Link>
      ) : null}

      {enAttente && echange.isHost ? (
        <div className={styles.actions}>
          {candidats.length > 1 ? (
            <select
              className={styles.choix}
              value={choisi}
              onChange={(evenement) => setChoisi(evenement.target.value)}
            >
              <option value="">{t('exchange.chooseHomeTitle')}</option>

              {candidats.map((candidat) => (
                <option key={candidat.id} value={candidat.id}>
                  {candidat.title}
                </option>
              ))}
            </select>
          ) : null}

          <button
            type="button"
            className={styles.boutonClair}
            disabled={occupe}
            onClick={() => repondre('DECLINE')}
          >
            {t('chat.exchangeDecline')}
          </button>

          <button
            type="button"
            className={styles.boutonSombre}
            disabled={occupe}
            onClick={() => repondre('ACCEPT')}
          >
            {t('chat.exchangeAccept')}
          </button>
        </div>
      ) : null}

      {confirme || (enAttente && !echange.isHost) ? (
        confirmeAnnulation ? (
          <div className={styles.actions}>
            <span className={styles.periode}>
              {t('chat.cancelExchangeConfirm')}
            </span>

            <button
              type="button"
              className={styles.boutonClair}
              onClick={() => setConfirmeAnnulation(false)}
            >
              {t('common.cancel')}
            </button>

            <button
              type="button"
              className={styles.boutonDanger}
              disabled={occupe}
              onClick={annuler}
            >
              {t('chat.cancelExchangeConfirmed')}
            </button>
          </div>
        ) : (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.boutonDanger}
              onClick={() => setConfirmeAnnulation(true)}
            >
              {t('chat.cancelExchange')}
            </button>
          </div>
        )
      ) : null}
    </div>
  );
}
