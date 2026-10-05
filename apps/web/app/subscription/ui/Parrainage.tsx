'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  applyReferral,
  confirmStudentCode,
  fetchReferral,
  fetchStudent,
  sendStudentCode,
  type EtatEtudiant,
  type EtatParrainage,
} from 'app/subscription/infrastructure/subscription.api';

import styles from './Abonnement.module.css';

export function Parrainage() {
  const t = useTranslations();
  const locale = useLocale();

  const [token, setToken] = useState<string | null>(null);
  const [parrainage, setParrainage] = useState<EtatParrainage | null>(null);
  const [etudiant, setEtudiant] = useState<EtatEtudiant | null>(null);

  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [codeRecu, setCodeRecu] = useState('');

  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

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

    if (!session) return;

    let actif = true;

    setToken(session.accessToken);

    Promise.all([
      fetchReferral(session.accessToken).catch(() => null),
      fetchStudent(session.accessToken).catch(() => null),
    ]).then(([mien, scolaire]) => {
      if (!actif) return;

      setParrainage(mien);
      setEtudiant(scolaire);
    });

    return () => {
      actif = false;
    };
  }, []);

  async function appliquerLeCode(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const propre = code.trim();

    if (!token || !propre || occupe) return;

    setOccupe(true);
    setErreur(null);

    try {
      setParrainage(await applyReferral(token, propre));
      setCode('');
    } catch {
      setErreur(t('subscription.error'));
    } finally {
      setOccupe(false);
    }
  }

  async function demanderLeCode(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const propre = email.trim();

    if (!token || !propre || occupe) return;

    setOccupe(true);
    setErreur(null);

    try {
      setEtudiant(await sendStudentCode(token, propre));
    } catch {
      setErreur(t('subscription.error'));
    } finally {
      setOccupe(false);
    }
  }

  async function confirmerLeCode(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const propre = codeRecu.trim();

    if (!token || !propre || occupe) return;

    setOccupe(true);
    setErreur(null);

    try {
      setEtudiant(await confirmStudentCode(token, propre));
      setCodeRecu('');
    } catch {
      setErreur(t('subscription.error'));
    } finally {
      setOccupe(false);
    }
  }

  if (!token) return null;

  return (
    <>
      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      {parrainage ? (
        <section className={styles.bloc}>
          <h2 className={styles.blocTitre}>
            {t('subscription.referralTitle')}
          </h2>

          <div className={styles.ligne}>
            <span>{t('subscription.yourCode')}</span>
            <span className={styles.valeur}>{parrainage.code}</span>
          </div>

          <div className={styles.ligne}>
            <span>{t('subscription.godchildren')}</span>
            <span className={styles.valeur}>{parrainage.filleuls}</span>
          </div>

          <div className={styles.ligne}>
            <span>{t('subscription.rewarded')}</span>
            <span className={styles.valeur}>{parrainage.recompenses}</span>
          </div>

          {parrainage.parraine ? (
            <p className={styles.aide}>
              {t('subscription.alreadyReferred')}
            </p>
          ) : (
            <form className={styles.enLigne} onSubmit={appliquerLeCode}>
              <input
                className={styles.champ}
                value={code}
                placeholder={t('subscription.enterCode')}
                onChange={(evenement) => setCode(evenement.target.value)}
              />

              <button
                type="submit"
                className={styles.boutonSombre}
                disabled={occupe}
              >
                {t('subscription.apply')}
              </button>
            </form>
          )}
        </section>
      ) : null}

      {etudiant ? (
        <section className={styles.bloc}>
          <h2 className={styles.blocTitre}>
            {t('subscription.studentTitle')}
          </h2>

          <p className={styles.aide}>{t('subscription.studentHint')}</p>

          {etudiant.etudiant ? (
            <div className={styles.ligne}>
              <span>{etudiant.email}</span>

              <span className={styles.valeur}>
                {etudiant.jusquAu
                  ? dates.format(new Date(etudiant.jusquAu))
                  : ''}
              </span>
            </div>
          ) : (
            <>
              <form className={styles.enLigne} onSubmit={demanderLeCode}>
                <input
                  className={styles.champ}
                  type="email"
                  value={email}
                  placeholder={t('subscription.studentEmail')}
                  onChange={(evenement) => setEmail(evenement.target.value)}
                />

                <button
                  type="submit"
                  className={styles.boutonClair}
                  disabled={occupe}
                >
                  {etudiant.codeEnvoye
                    ? t('subscription.studentResend')
                    : t('subscription.studentSend')}
                </button>
              </form>

              {etudiant.codeEnvoye ? (
                <form className={styles.enLigne} onSubmit={confirmerLeCode}>
                  <input
                    className={styles.champ}
                    value={codeRecu}
                    placeholder={t('subscription.studentCode')}
                    onChange={(evenement) =>
                      setCodeRecu(evenement.target.value)
                    }
                  />

                  <button
                    type="submit"
                    className={styles.boutonSombre}
                    disabled={occupe}
                  >
                    {t('subscription.apply')}
                  </button>
                </form>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </>
  );
}
