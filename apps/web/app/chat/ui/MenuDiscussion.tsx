'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';

import { blockUser, reportUser } from 'app/profile/infrastructure/account.api';
import { getHomesByOwnerId } from 'app/home/infrastructure/home.api';
import styles from './MenuDiscussion.module.css';

const MOTIFS = [
  'harassment',
  'inappropriate',
  'scam',
  'fakeProfile',
  'spam',
  'other',
] as const;

type Props = {
  token: string;
  participantId: string;
  traduisible: boolean;
  traduit: boolean;
  onBasculerTraduction: () => void;
  onPartiePourDeBon: () => void;
};

export function MenuDiscussion({
  token,
  participantId,
  traduisible,
  traduit,
  onBasculerTraduction,
  onPartiePourDeBon,
}: Props) {
  const t = useTranslations('chat');
  const router = useRouter();

  const [ouvert, setOuvert] = useState(false);
  const [motifsOuverts, setMotifsOuverts] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const porte = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;

    function auClicDehors(evenement: MouseEvent) {
      if (!porte.current?.contains(evenement.target as Node)) {
        setOuvert(false);
        setMotifsOuverts(false);
      }
    }

    document.addEventListener('mousedown', auClicDehors);

    return () => document.removeEventListener('mousedown', auClicDehors);
  }, [ouvert]);

  async function proposerUnEchange() {
    setEnCours(true);
    setErreur(null);

    try {
      const logements = await getHomesByOwnerId(participantId);
      const [premier] = logements;

      if (!premier) {
        setErreur(t('noHomeToExchange'));
        return;
      }

      setOuvert(false);

      router.push(
        logements.length === 1
          ? `/homes/${premier.id}`
          : `/profile?userId=${participantId}`,
      );
    } catch {
      setErreur(t('reportError'));
    } finally {
      setEnCours(false);
    }
  }

  async function bloquer() {
    setEnCours(true);
    setErreur(null);

    try {
      await blockUser(token, participantId);
      onPartiePourDeBon();
    } catch {
      setErreur(t('reportError'));
    } finally {
      setEnCours(false);
    }
  }

  async function signaler(motif: string) {
    setEnCours(true);
    setErreur(null);

    try {
      await reportUser(token, participantId, t(`reportReasons.${motif}`));
      onPartiePourDeBon();
    } catch {
      setErreur(t('reportError'));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className={styles.porte} ref={porte}>
      <button
        type="button"
        className={styles.declencheur}
        onClick={() => setOuvert((etat) => !etat)}
        aria-haspopup="menu"
        aria-expanded={ouvert}
        aria-label={t('reportTitle')}
      >
        <Info size={18} />
      </button>

      {ouvert ? (
        <div className={styles.menu} role="menu">
          {motifsOuverts ? (
            <>
              <p className={styles.titre}>{t('reportTitle')}</p>

              {MOTIFS.map((motif) => (
                <button
                  key={motif}
                  type="button"
                  role="menuitem"
                  className={styles.entree}
                  disabled={enCours}
                  onClick={() => signaler(motif)}
                >
                  {t(`reportReasons.${motif}`)}
                </button>
              ))}

              <button
                type="button"
                className={styles.annuler}
                onClick={() => setMotifsOuverts(false)}
              >
                {t('cancel')}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/profile?userId=${participantId}`}
                role="menuitem"
                className={styles.entree}
              >
                {t('viewProfile')}
              </Link>

              <button
                type="button"
                role="menuitem"
                className={styles.entree}
                disabled={enCours}
                onClick={proposerUnEchange}
              >
                {t('proposeExchange')}
              </button>

              {traduisible ? (
                <button
                  type="button"
                  role="menuitem"
                  className={styles.entree}
                  onClick={() => {
                    onBasculerTraduction();
                    setOuvert(false);
                  }}
                >
                  {traduit ? t('stopTranslation') : t('restoreTranslation')}
                </button>
              ) : null}

              <button
                type="button"
                role="menuitem"
                className={styles.entree}
                onClick={() => setMotifsOuverts(true)}
              >
                {t('report')}
              </button>

              <button
                type="button"
                role="menuitem"
                className={styles.danger}
                disabled={enCours}
                onClick={bloquer}
              >
                {t('blockUser')}
              </button>
            </>
          )}

          {erreur ? <p className={styles.erreur}>{erreur}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
