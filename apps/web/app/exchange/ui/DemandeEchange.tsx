'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Home } from '@wim/shared';

import { getSession } from 'app/auth/infrastructure/authStorage';
import { requestExchange } from 'app/exchange/infrastructure/exchange.api';
import { getMyHomes } from 'app/home/infrastructure/home.api';

import styles from './DemandeEchange.module.css';

type Props = {
  homeId: string;
  ownerId: string;
  capacite: number;
};

type Etat = 'chargement' | 'anonyme' | 'mien' | 'prete';

const VOYAGEURS_MAX = 16;

function ouvrirLeCalendrier(champ: HTMLInputElement) {
  const avecSelecteur = champ as HTMLInputElement & { showPicker?: () => void };

  avecSelecteur.showPicker?.();
}

export function DemandeEchange({ homeId, ownerId, capacite }: Props) {
  const t = useTranslations();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [miens, setMiens] = useState<Home[]>([]);

  const [ouvert, setOuvert] = useState(false);
  const [offert, setOffert] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [voyageurs, setVoyageurs] = useState('1');
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

  if (etat === 'mien') return null;

  if (etat === 'anonyme') {
    return (
      <div className={styles.appel}>
        <p className={styles.appelTexte}>{t('home.shareCtaText')}</p>

        <Link href="/register" className={styles.boutonDegrade}>
          {t('home.shareCtaButton')}
        </Link>
      </div>
    );
  }

  if (etat === 'chargement') {
    return <p className={styles.appelTexte}>{t('common.loading')}</p>;
  }

  const places = Math.max(1, Math.min(capacite || 1, VOYAGEURS_MAX));

  return (
    <form className={styles.appel} onSubmit={envoyer}>
      <div className={styles.reservation}>
        <div className={styles.dates}>
          <label className={styles.boite}>
            <span className={styles.etiquette}>{t('home.arrival')}</span>

            <span className={styles.valeur}>
              <input
                type="date"
                className={`${styles.saisie} ${debut ? '' : styles.saisieVide}`}
                value={debut}
                onClick={(evenement) => ouvrirLeCalendrier(evenement.currentTarget)}
                onChange={(evenement) => setDebut(evenement.target.value)}
              />

              {debut ? null : (
                <span className={styles.invite}>{t('home.addDate')}</span>
              )}
            </span>
          </label>

          <label className={styles.boite}>
            <span className={styles.etiquette}>{t('home.departure')}</span>

            <span className={styles.valeur}>
              <input
                type="date"
                className={`${styles.saisie} ${fin ? '' : styles.saisieVide}`}
                value={fin}
                min={debut || undefined}
                onClick={(evenement) => ouvrirLeCalendrier(evenement.currentTarget)}
                onChange={(evenement) => setFin(evenement.target.value)}
              />

              {fin ? null : (
                <span className={styles.invite}>{t('home.addDate')}</span>
              )}
            </span>
          </label>
        </div>

        <label className={`${styles.boite} ${styles.boiteVoyageurs}`}>
          <span className={styles.etiquette}>{t('home.travelers')}</span>

          <span className={styles.valeur}>
            <select
              className={styles.saisie}
              value={voyageurs}
              onChange={(evenement) => setVoyageurs(evenement.target.value)}
            >
              {Array.from({ length: places }, (_, index) => index + 1).map(
                (nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}{' '}
                    {nombre > 1 ? t('home.travelers') : t('home.traveler')}
                  </option>
                ),
              )}
            </select>

            <ChevronDown size={18} className={styles.chevron} />
          </span>
        </label>
      </div>

      {ouvert ? (
        <>
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
        </>
      ) : null}

      <button
        type={ouvert ? 'submit' : 'button'}
        className={styles.boutonDegrade}
        disabled={ouvert && (envoi || message.trim().length === 0)}
        onClick={
          ouvert
            ? undefined
            : () => {
                setMessage(t('contact.defaultMessageContent'));
                setOuvert(true);
              }
        }
      >
        {ouvert ? t('contact.send') : t('common.contact')}
      </button>

      <p className={styles.mention}>{t('home.noCommitment')}</p>
    </form>
  );
}
