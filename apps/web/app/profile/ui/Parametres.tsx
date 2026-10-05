'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { IdentityStatus, type UserProfile } from '@wim/shared';

import {
  clearSession,
  getSession,
} from 'app/auth/infrastructure/authStorage';
import { SITE_URL } from 'app/home/infrastructure/api';
import {
  deleteMyAccount,
  exportMyData,
  getBlockedUsers,
  startIdentityVerification,
  unblockUser,
  type BlockedUser,
} from 'app/profile/infrastructure/account.api';
import {
  getMyProfile,
  updateMyProfile,
} from 'app/profile/infrastructure/profile.api';

import styles from './Parametres.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

type Reglage = keyof Pick<
  UserProfile,
  | 'notifyNewMessages'
  | 'notifyExchanges'
  | 'notifySms'
  | 'marketingEmails'
  | 'profileVisible'
  | 'showPreciseLocation'
  | 'showAge'
  | 'allowMessages'
  | 'dataSharing'
>;

const NOTIFICATIONS: { cle: Reglage; libelle: string }[] = [
  { cle: 'notifyNewMessages', libelle: 'profile.settings.newMessages' },
  { cle: 'notifyExchanges', libelle: 'profile.settings.updateMessages' },
  { cle: 'notifySms', libelle: 'profile.settings.smsNotifications' },
  { cle: 'marketingEmails', libelle: 'profile.settings.emailMarketing' },
];

const CONFIDENTIALITE: { cle: Reglage; libelle: string }[] = [
  { cle: 'profileVisible', libelle: 'profile.settings.profileVisibility' },
  { cle: 'showPreciseLocation', libelle: 'profile.settings.preciseLocation' },
  { cle: 'showAge', libelle: 'profile.settings.yearSharing' },
  { cle: 'allowMessages', libelle: 'profile.settings.allowMessage' },
  { cle: 'dataSharing', libelle: 'profile.settings.dataSharing' },
];

export function Parametres() {
  const t = useTranslations();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [bloques, setBloques] = useState<BlockedUser[]>([]);

  const [erreur, setErreur] = useState<string | null>(null);
  const [exporte, setExporte] = useState(false);
  const [confirmation, setConfirmation] = useState(0);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    setToken(session.accessToken);

    Promise.all([
      getMyProfile(session.accessToken),
      getBlockedUsers(session.accessToken).catch(() => []),
    ])
      .then(([mien, liste]) => {
        if (!actif) return;

        setProfil(mien);
        setBloques(liste);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

  async function enregistrer(champs: Partial<UserProfile>) {
    if (!token || !profil) return;

    const precedent = profil;

    setProfil({ ...profil, ...champs });
    setErreur(null);

    try {
      setProfil(await updateMyProfile(token, champs));
    } catch {
      setProfil(precedent);
      setErreur(t('profile.settings.saveError'));
    }
  }

  async function demanderMesDonnees() {
    if (!token) return;

    setErreur(null);

    try {
      await exportMyData(token);
      setExporte(true);
    } catch {
      setErreur(t('common.genericError'));
    }
  }

  async function supprimerLeCompte() {
    if (!token) return;

    setErreur(null);

    try {
      await deleteMyAccount(token);
      clearSession();
      router.push('/login');
    } catch {
      setErreur(t('common.genericError'));
    }
  }

  async function verifierMonIdentite() {
    if (!token) return;

    setErreur(null);

    try {
      const { url } = await startIdentityVerification(token);

      if (url) window.location.href = url;
    } catch {
      setErreur(t('auth.identity.error'));
    }
  }

  async function debloquer(userId: string) {
    if (!token) return;

    setErreur(null);

    try {
      await unblockUser(token, userId);
      setBloques((liste) => liste.filter((bloque) => bloque.id !== userId));
    } catch {
      setErreur(t('common.genericError'));
    }
  }

  function seDeconnecter() {
    clearSession();
    router.push('/login');
  }

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('profile.loading')}</p>;
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

  if (etat === 'erreur' || !profil) {
    return <p className={styles.etat}>{t('profile.profileNotFound')}</p>;
  }

  const statutIdentite =
    profil.identityStatus === IdentityStatus.VERIFIED || profil.identityVerified
      ? t('profile.settings.verified')
      : profil.identityStatus === IdentityStatus.REFUSED
        ? t('profile.settings.refused')
        : profil.identityStatus === IdentityStatus.IN_PROGRESS
          ? t('profile.settings.inProgress')
          : t('profile.settings.notVerified');

  const identiteFaite =
    profil.identityStatus === IdentityStatus.VERIFIED ||
    profil.identityVerified === true;

  function bascule({ cle, libelle }: { cle: Reglage; libelle: string }) {
    return (
      <label key={cle} className={styles.ligne}>
        <span>{t(libelle)}</span>

        <input
          type="checkbox"
          className={styles.interrupteur}
          checked={profil?.[cle] === true}
          onChange={(evenement) =>
            enregistrer({ [cle]: evenement.target.checked } as Partial<UserProfile>)
          }
        />
      </label>
    );
  }

  return (
    <div className={styles.page}>
      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('profile.settings.account')}</h2>

        <Link href="/account/edit" className={styles.ligneLien}>
          {t('profile.settings.personalInfo')}
        </Link>

        <Link href="/subscription" className={styles.ligneLien}>
          {t('profile.settings.subscription')}
        </Link>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.settings.verification')}
        </h2>

        <div className={styles.ligne}>
          <span>{t('profile.settings.verificationStatus')}</span>
          <span className={styles.valeur}>{statutIdentite}</span>
        </div>

        {identiteFaite ? null : (
          <button
            type="button"
            className={styles.boutonClair}
            onClick={verifierMonIdentite}
          >
            {t('auth.identity.gateAction')}
          </button>
        )}
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.settings.notifications')}
        </h2>

        {NOTIFICATIONS.map(bascule)}

        <Link href="/notifications" className={styles.ligneLien}>
          {t('notifications.title')}
        </Link>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('profile.settings.privacy')}</h2>

        {CONFIDENTIALITE.map(bascule)}

        <div className={styles.sousBloc}>
          <p className={styles.sousTitre}>{t('profile.blocked.title')}</p>

          {bloques.length === 0 ? (
            <p className={styles.valeur}>{t('common.notProvided')}</p>
          ) : (
            bloques.map((bloque) => (
              <div key={bloque.id} className={styles.ligne}>
                <span className={styles.bloqueNom}>
                  <span className={styles.avatar}>
                    {bloque.avatarUrl ? (
                      <Image
                        src={bloque.avatarUrl}
                        alt=""
                        fill
                        className={styles.avatarImage}
                      />
                    ) : null}
                  </span>

                  {[bloque.firstName, bloque.lastName]
                    .filter(Boolean)
                    .join(' ')}
                </span>

                <button
                  type="button"
                  className={styles.boutonClair}
                  onClick={() => debloquer(bloque.id)}
                >
                  {t('profile.blocked.unblock')}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('profile.settings.preferences')}
        </h2>

        <label className={styles.ligne}>
          <span>{t('profile.settings.language')}</span>

          <select
            className={styles.choix}
            value={profil.preferredLocale}
            onChange={(evenement) =>
              enregistrer({
                preferredLocale: evenement.target.value as 'fr' | 'en',
              })
            }
          >
            <option value="fr">{t('profile.language.french')}</option>
            <option value="en">{t('profile.language.english')}</option>
          </select>
        </label>

        <label className={styles.ligne}>
          <span>{t('profile.settings.currency')}</span>

          <select
            className={styles.choix}
            value={profil.currency ?? 'EUR'}
            onChange={(evenement) =>
              enregistrer({
                currency: evenement.target.value as 'EUR' | 'USD',
              })
            }
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </label>

        <label className={styles.ligne}>
          <span>{t('profile.settings.distanceUnit')}</span>

          <select
            className={styles.choix}
            value={profil.distanceUnit ?? 'km'}
            onChange={(evenement) =>
              enregistrer({
                distanceUnit: evenement.target.value as 'km' | 'mi',
              })
            }
          >
            <option value="km">{t('profile.settings.kilometers')}</option>
            <option value="mi">{t('profile.settings.miles')}</option>
          </select>
        </label>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('profile.settings.assistance')}</h2>

        <Link href="/account/support" className={styles.ligneLien}>
          {t('profile.settings.contactSupport')}
        </Link>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('profile.settings.legal')}</h2>

        <a
          className={styles.ligneLien}
          href={`${SITE_URL}/conditions.html`}
          target="_blank"
          rel="noreferrer"
        >
          {t('profile.settings.termsOfService')}
        </a>

        <a
          className={styles.ligneLien}
          href={`${SITE_URL}/confidentialite.html`}
          target="_blank"
          rel="noreferrer"
        >
          {t('profile.settings.privacyPolicy')}
        </a>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('profile.settings.myData')}</h2>

        {exporte ? (
          <div className={styles.sousBloc}>
            <p className={styles.valeur}>
              {t('profile.settings.exportRequested')}
            </p>

            <p className={styles.sousTitre}>{profil.email}</p>
          </div>
        ) : (
          <button
            type="button"
            className={styles.boutonClair}
            onClick={demanderMesDonnees}
          >
            {t('profile.settings.exportData')}
          </button>
        )}
      </section>

      <section className={styles.blocDanger}>
        <h2 className={styles.blocTitre}>{t('profile.settings.dangerZone')}</h2>

        <button
          type="button"
          className={styles.boutonDanger}
          onClick={seDeconnecter}
        >
          {t('profile.logout')}
        </button>

        {confirmation === 0 ? (
          <button
            type="button"
            className={styles.boutonDanger}
            onClick={() => setConfirmation(1)}
          >
            {t('profile.settings.deleteAccount')}
          </button>
        ) : null}

        {confirmation === 1 ? (
          <div className={styles.sousBloc}>
            <p className={styles.valeur}>
              {t('profile.settings.deleteAccountBody')}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.boutonClair}
                onClick={() => setConfirmation(0)}
              >
                {t('common.cancel')}
              </button>

              <button
                type="button"
                className={styles.boutonDanger}
                onClick={() => setConfirmation(2)}
              >
                {t('profile.settings.deleteAccountContinue')}
              </button>
            </div>
          </div>
        ) : null}

        {confirmation === 2 ? (
          <div className={styles.sousBloc}>
            <p className={styles.sousTitre}>
              {t('profile.settings.deleteAccountLastTitle')}
            </p>

            <p className={styles.valeur}>
              {t('profile.settings.deleteAccountLastBody')}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.boutonClair}
                onClick={() => setConfirmation(0)}
              >
                {t('common.cancel')}
              </button>

              <button
                type="button"
                className={styles.boutonDanger}
                onClick={supprimerLeCompte}
              >
                {t('profile.settings.deleteAccountConfirm')}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
