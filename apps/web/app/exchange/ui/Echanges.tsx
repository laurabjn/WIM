'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Exchange, ExchangeStatus } from '@wim/shared';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  getMyExchanges,
  getStaysToReview,
  reviewStay,
  type StayToReview,
} from 'app/exchange/infrastructure/exchange.api';

import styles from './Echanges.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

const COMMENTAIRE_MIN = 10;
const COMMENTAIRE_MAX = 1000;
const NOTES = [1, 2, 3, 4, 5];

const SECTIONS: { statut: ExchangeStatus; titre: string }[] = [
  { statut: 'CURRENT', titre: 'exchange.currentExchanges' },
  { statut: 'FUTURE', titre: 'exchange.upcomingExchanges' },
  { statut: 'PAST', titre: 'exchange.pastExchanges' },
];

export function Echanges() {
  const t = useTranslations();
  const locale = useLocale();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [echanges, setEchanges] = useState<Exchange[]>([]);
  const [sejours, setSejours] = useState<StayToReview[]>([]);

  const [aNoter, setANoter] = useState<string | null>(null);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreurAvis, setErreurAvis] = useState<string | null>(null);

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
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    setToken(session.accessToken);

    Promise.all([
      getMyExchanges(session.accessToken),
      getStaysToReview(session.accessToken).catch(() => []),
    ])
      .then(([liste, attente]) => {
        if (!actif) return;

        setEchanges(liste);
        setSejours(attente);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

  function ouvrirLaNote(sejour: StayToReview) {
    setANoter(sejour.exchangeId);
    setNote(0);
    setCommentaire('');
    setErreurAvis(null);
  }

  async function publierLAvis(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const propre = commentaire.trim();

    if (!token || !aNoter || note === 0 || propre.length < COMMENTAIRE_MIN) {
      return;
    }

    setEnvoi(true);
    setErreurAvis(null);

    try {
      await reviewStay(token, aNoter, note, propre);

      setSejours((liste) =>
        liste.filter((sejour) => sejour.exchangeId !== aNoter),
      );
      setANoter(null);
    } catch (erreur) {
      setErreurAvis(
        erreur instanceof Error ? erreur.message : t('exchange.review.error'),
      );
    } finally {
      setEnvoi(false);
    }
  }

  function periode(debut: string, fin: string) {
    return `${dates.format(new Date(debut))} – ${dates.format(new Date(fin))}`;
  }

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('common.loading')}</p>;
  }

  if (etat === 'anonyme') {
    return (
      <div className={styles.etat}>
        <p>{t('common.signInRequired')}</p>

        <Link href="/login" className={styles.lien}>
          {t('common.signIn')}
        </Link>
      </div>
    );
  }

  if (etat === 'erreur') {
    return <p className={styles.etat}>{t('common.genericError')}</p>;
  }

  const sections = SECTIONS.map((section) => ({
    ...section,
    elements: echanges.filter((echange) => echange.status === section.statut),
  })).filter((section) => section.elements.length > 0);

  return (
    <div className={styles.page}>
      {sejours.length > 0 ? (
        <section className={styles.rappel}>
          <h2 className={styles.rappelTitre}>
            {t('exchange.review.pendingTitle')}
          </h2>

          <p className={styles.rappelTexte}>
            {t('exchange.review.pendingText')}
          </p>

          {sejours.map((sejour) => (
            <div key={sejour.exchangeId} className={styles.sejour}>
              <div className={styles.sejourEntete}>
                <span className={styles.vignette}>
                  {sejour.homePhotoUrl ? (
                    <Image
                      src={sejour.homePhotoUrl}
                      alt={sejour.homeTitle}
                      fill
                      className={styles.vignetteImage}
                    />
                  ) : null}
                </span>

                <span className={styles.sejourTextes}>
                  <span className={styles.sejourTitre}>
                    {sejour.homeTitle}
                  </span>

                  <span className={styles.sejourDates}>
                    {sejour.partnerFirstName} ·{' '}
                    {periode(sejour.startDate, sejour.endDate)}
                  </span>
                </span>

                {aNoter === sejour.exchangeId ? null : (
                  <button
                    type="button"
                    className={styles.boutonSombre}
                    onClick={() => ouvrirLaNote(sejour)}
                  >
                    {t('exchange.review.rateNow')}
                  </button>
                )}
              </div>

              {aNoter === sejour.exchangeId ? (
                <form className={styles.avis} onSubmit={publierLAvis}>
                  <p className={styles.question}>
                    {t('exchange.review.scoreQuestion')}
                  </p>

                  <div className={styles.etoiles}>
                    {NOTES.map((valeur) => (
                      <button
                        key={valeur}
                        type="button"
                        className={`${styles.etoile} ${
                          valeur <= note ? styles.etoilePleine : ''
                        }`.trim()}
                        onClick={() => setNote(valeur)}
                        aria-label={String(valeur)}
                      >
                        {valeur <= note ? '★' : '☆'}
                      </button>
                    ))}
                  </div>

                  <p className={styles.question}>
                    {t('exchange.review.commentQuestion')}
                  </p>

                  <textarea
                    className={styles.zone}
                    value={commentaire}
                    rows={4}
                    maxLength={COMMENTAIRE_MAX}
                    placeholder={t('exchange.review.commentPlaceholder')}
                    onChange={(evenement) =>
                      setCommentaire(evenement.target.value)
                    }
                  />

                  <p className={styles.compteur}>
                    {commentaire.trim().length} / {COMMENTAIRE_MIN}
                  </p>

                  <p className={styles.obligatoire}>
                    {t('exchange.review.mandatory')}
                  </p>

                  {erreurAvis ? (
                    <p className={styles.erreur}>{erreurAvis}</p>
                  ) : null}

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.boutonClair}
                      onClick={() => setANoter(null)}
                    >
                      {t('exchange.review.later')}
                    </button>

                    <button
                      type="submit"
                      className={styles.boutonSombre}
                      disabled={
                        envoi ||
                        note === 0 ||
                        commentaire.trim().length < COMMENTAIRE_MIN
                      }
                    >
                      {t('exchange.review.submit')}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {sections.length === 0 ? (
        <div className={styles.vide}>
          <p className={styles.videTitre}>{t('exchange.noExchanges')}</p>
          <p className={styles.videTexte}>
            {t('exchange.noExchangesDescription')}
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <section key={section.statut} className={styles.section}>
            <h2 className={styles.sectionTitre}>{t(section.titre)}</h2>

            <div className={styles.cartes}>
              {section.elements.map((echange) => (
                <article key={echange.id} className={styles.carte}>
                  <Link
                    href={`/homes/${echange.homeId}`}
                    className={styles.carteImage}
                  >
                    {echange.homeImageUrl ? (
                      <Image
                        src={echange.homeImageUrl}
                        alt={echange.homeTitle}
                        fill
                        className={styles.carteImageFond}
                      />
                    ) : null}
                  </Link>

                  <div className={styles.carteCorps}>
                    <h3 className={styles.carteTitre}>{echange.homeTitle}</h3>

                    <p className={styles.carteLieu}>{echange.location}</p>

                    <p className={styles.carteDates}>
                      {periode(echange.startDate, echange.endDate)}
                    </p>

                    <p className={styles.carteRole}>
                      {echange.isHost
                        ? t('exchange.host')
                        : t('exchange.guest')}

                      {echange.partner
                        ? ` · ${[
                            echange.partner.firstName,
                            echange.partner.lastName,
                          ]
                            .filter(Boolean)
                            .join(' ')}`
                        : ''}
                    </p>

                    <div className={styles.carteActions}>
                      <Link
                        href={`/homes/${echange.homeId}`}
                        className={styles.boutonClair}
                      >
                        {t('common.seeMore')}
                      </Link>

                      {echange.chatId ? (
                        <Link
                          href={`/messages?chat=${echange.chatId}`}
                          className={styles.boutonSombre}
                        >
                          {t('common.messages')}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
