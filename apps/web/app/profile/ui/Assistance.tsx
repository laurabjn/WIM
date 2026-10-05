'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  contactSupport,
  type SupportTopic,
} from 'app/profile/infrastructure/account.api';

import styles from './Assistance.module.css';

const SUJETS: SupportTopic[] = [
  'account',
  'exchange',
  'booking',
  'payment',
  'technical',
  'other',
];

type Etat = 'chargement' | 'anonyme' | 'prete';

export function Assistance() {
  const t = useTranslations();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);

  const [sujet, setSujet] = useState<SupportTopic>('account');
  const [objet, setObjet] = useState('');
  const [message, setMessage] = useState('');

  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    setToken(session.accessToken);
    setEtat('prete');
  }, []);

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    if (!token || envoi) return;

    const propreObjet = objet.trim();
    const propreMessage = message.trim();

    if (!propreObjet || !propreMessage) {
      setErreur(t('profile.helpScreen.requiredFields'));

      return;
    }

    setEnvoi(true);
    setErreur(null);

    try {
      await contactSupport(token, {
        topic: sujet,
        subject: propreObjet,
        message: propreMessage,
      });

      setObjet('');
      setMessage('');
      setEnvoye(true);
    } catch {
      setErreur(t('profile.support.error'));
    } finally {
      setEnvoi(false);
    }
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

  return (
    <form className={styles.formulaire} onSubmit={envoyer}>
      <p className={styles.intro}>{t('profile.helpScreen.introText')}</p>

      <label className={styles.champ}>
        <span className={styles.libelle}>{t('profile.support.topic')}</span>

        <select
          value={sujet}
          onChange={(evenement) =>
            setSujet(evenement.target.value as SupportTopic)
          }
        >
          {SUJETS.map((candidat) => (
            <option key={candidat} value={candidat}>
              {t(`profile.support.topics.${candidat}`)}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.champ}>
        <span className={styles.libelle}>{t('profile.support.subject')}</span>

        <input
          value={objet}
          maxLength={150}
          placeholder={t('profile.support.subjectPlaceholder')}
          onChange={(evenement) => setObjet(evenement.target.value)}
        />
      </label>

      <label className={styles.champ}>
        <span className={styles.libelle}>{t('profile.support.message')}</span>

        <textarea
          value={message}
          rows={6}
          maxLength={5000}
          placeholder={t('profile.support.messagePlaceholder')}
          onChange={(evenement) => setMessage(evenement.target.value)}
        />
      </label>

      <p className={styles.delai}>{t('profile.support.answerDelay')}</p>

      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      {envoye ? (
        <p className={styles.succes}>{t('profile.support.sent')}</p>
      ) : null}

      <div className={styles.actions}>
        <Link href="/account" className={styles.boutonClair}>
          {t('common.cancel')}
        </Link>

        <button type="submit" className={styles.boutonSombre} disabled={envoi}>
          {t('profile.support.send')}
        </button>
      </div>
    </form>
  );
}
