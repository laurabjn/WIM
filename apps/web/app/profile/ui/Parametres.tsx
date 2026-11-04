'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';
import { IdentityStatus, type UserProfile } from '@wim/shared';
import {
  ArrowLeftRight,
  BadgeCheck,
  Ban,
  Bell,
  Cake,
  ChevronRight,
  CircleHelp,
  Coins,
  CreditCard,
  Download,
  Eye,
  FileText,
  Flag,
  Heart,
  Languages,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  Shield,
  SunMoon,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react';

import { clearSession, getSession } from 'app/auth/infrastructure/authStorage';
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
import { enregistrerTheme, lireTheme, type Theme } from 'app/ui/theme/theme';

import styles from './Parametres.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

type Reglage = keyof Pick<
  UserProfile,
  | 'notifyPush'
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

type Bascule = { cle: Reglage; libelle: string; Icone: LucideIcon };

const NOTIFICATIONS: Bascule[] = [
  {
    cle: 'notifyPush',
    libelle: 'profile.settings.pushNotifications',
    Icone: Bell,
  },
  {
    cle: 'notifyNewMessages',
    libelle: 'profile.settings.newMessages',
    Icone: MessageCircle,
  },
  {
    cle: 'notifyExchanges',
    libelle: 'profile.settings.updateMessages',
    Icone: ArrowLeftRight,
  },
  { cle: 'notifySms', libelle: 'profile.settings.smsNotifications', Icone: Phone },
  { cle: 'marketingEmails', libelle: 'profile.settings.emailMarketing', Icone: Mail },
];

const CONFIDENTIALITE: Bascule[] = [
  { cle: 'profileVisible', libelle: 'profile.settings.profileVisibility', Icone: Eye },
  {
    cle: 'showPreciseLocation',
    libelle: 'profile.settings.preciseLocation',
    Icone: MapPin,
  },
  { cle: 'showAge', libelle: 'profile.settings.yearSharing', Icone: Cake },
  {
    cle: 'allowMessages',
    libelle: 'profile.settings.allowMessage',
    Icone: MessageCircle,
  },
  { cle: 'dataSharing', libelle: 'profile.settings.dataSharing', Icone: Share2 },
];

function Carte({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitre}>{titre}</h2>

      <div className={styles.carte}>{children}</div>
    </section>
  );
}

function Ligne({
  Icone,
  libelle,
  valeur,
  teinte,
  href,
  externe,
  onClick,
  danger,
}: {
  Icone: LucideIcon;
  libelle: string;
  valeur?: string;
  teinte?: 'verte' | 'rouge' | 'orange';
  href?: string;
  externe?: boolean;
  onClick?: () => void;
  danger?: boolean;
}) {
  const classe = danger ? `${styles.ligne} ${styles.ligneDanger}` : styles.ligne;

  const contenu = (
    <>
      <Icone size={18} className={styles.icone} />

      <span className={styles.libelle}>{libelle}</span>

      {valeur ? (
        <span
          className={teinte ? `${styles.valeur} ${styles[teinte]}` : styles.valeur}
        >
          {teinte ? <span className={styles.pastille} /> : null}
          {valeur}
        </span>
      ) : null}

      <ChevronRight size={18} className={styles.chevron} />
    </>
  );

  if (href && externe) {
    return (
      <a className={classe} href={href} target="_blank" rel="noreferrer">
        {contenu}
      </a>
    );
  }

  if (href) {
    return (
      <Link className={classe} href={href}>
        {contenu}
      </Link>
    );
  }

  return (
    <button type="button" className={classe} onClick={onClick}>
      {contenu}
    </button>
  );
}

function LigneChoix({
  Icone,
  libelle,
  children,
}: {
  Icone: LucideIcon;
  libelle: string;
  children: ReactNode;
}) {
  return (
    <label className={styles.ligne}>
      <Icone size={18} className={styles.icone} />

      <span className={styles.libelle}>{libelle}</span>

      {children}
    </label>
  );
}

export function Parametres() {
  const t = useTranslations();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [bloques, setBloques] = useState<BlockedUser[]>([]);
  const [theme, setTheme] = useState<Theme>('system');

  const [erreur, setErreur] = useState<string | null>(null);
  const [exporte, setExporte] = useState(false);
  const [listeBloques, setListeBloques] = useState(false);
  const [confirmation, setConfirmation] = useState(0);

  useEffect(() => {
    setTheme(lireTheme());

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

  function changerTheme(choix: Theme) {
    setTheme(choix);
    enregistrerTheme(choix);
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

  const identiteFaite =
    profil.identityStatus === IdentityStatus.VERIFIED ||
    profil.identityVerified === true;

  const statutIdentite = identiteFaite
    ? t('profile.settings.verified')
    : profil.identityStatus === IdentityStatus.REFUSED
      ? t('profile.settings.refused')
      : profil.identityStatus === IdentityStatus.IN_PROGRESS
        ? t('profile.settings.inProgress')
        : t('profile.settings.notVerified');

  const teinteIdentite = identiteFaite
    ? 'verte'
    : profil.identityStatus === IdentityStatus.REFUSED
      ? 'rouge'
      : 'orange';

  const nomComplet =
    `${profil.firstName ?? ''} ${profil.lastName ?? ''}`.trim() ||
    t('common.notProvided');

  const libelleTheme =
    theme === 'dark'
      ? t('profile.settings.themeDark')
      : theme === 'light'
        ? t('profile.settings.themeLight')
        : t('profile.settings.themeSystem');

  function bascule({ cle, libelle, Icone }: Bascule) {
    return (
      <label key={cle} className={styles.ligne}>
        <Icone size={18} className={styles.icone} />

        <span className={styles.libelle}>{t(libelle)}</span>

        <input
          type="checkbox"
          className={styles.interrupteur}
          checked={profil?.[cle] === true}
          onChange={(evenement) =>
            enregistrer({
              [cle]: evenement.target.checked,
            } as Partial<UserProfile>)
          }
        />
      </label>
    );
  }

  return (
    <div className={styles.page}>
      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      <div className={styles.colonnes}>
        <div className={styles.colonne}>
          <Carte titre={t('profile.settings.account')}>
            <Ligne
              Icone={User}
              libelle={t('profile.settings.personalInfo')}
              valeur={nomComplet}
              href="/account/edit"
            />

            <Ligne
              Icone={Mail}
              libelle={t('auth.register.email')}
              valeur={profil.email || t('common.notProvided')}
              href="/account/edit"
            />

            <Ligne
              Icone={Phone}
              libelle={t('auth.register.phone')}
              valeur={profil.phone || t('common.notProvided')}
              href="/account/edit"
            />

            <Ligne
              Icone={Lock}
              libelle={t('auth.register.password')}
              valeur="••••••••"
              href="/account/edit"
            />
          </Carte>

          <Carte titre={t('profile.settings.display')}>
            <LigneChoix Icone={SunMoon} libelle={t('profile.settings.theme')}>
              <select
                className={styles.choix}
                value={theme}
                aria-label={libelleTheme}
                onChange={(evenement) =>
                  changerTheme(evenement.target.value as Theme)
                }
              >
                <option value="system">
                  {t('profile.settings.themeSystem')}
                </option>
                <option value="light">
                  {t('profile.settings.themeLight')}
                </option>
                <option value="dark">{t('profile.settings.themeDark')}</option>
              </select>
            </LigneChoix>
          </Carte>

          <Carte titre={t('profile.settings.verification')}>
            <Ligne
              Icone={BadgeCheck}
              libelle={t('profile.settings.verificationStatus')}
              valeur={statutIdentite}
              teinte={teinteIdentite}
              onClick={identiteFaite ? undefined : verifierMonIdentite}
            />
          </Carte>

          <Carte titre={t('profile.settings.subscription')}>
            <Ligne
              Icone={CreditCard}
              libelle={t('subscription.mine')}
              valeur={t('subscription.manageValue')}
              href="/subscription"
            />
          </Carte>

          <Carte titre={t('profile.settings.notifications')}>
            {NOTIFICATIONS.map(bascule)}

            <Ligne
              Icone={Bell}
              libelle={t('notifications.title')}
              href="/notifications"
            />
          </Carte>
        </div>

        <div className={styles.colonne}>
          <Carte titre={t('profile.settings.privacy')}>
            {CONFIDENTIALITE.map(bascule)}

            <Ligne
              Icone={Ban}
              libelle={t('profile.blocked.title')}
              valeur={
                bloques.length > 0
                  ? String(bloques.length)
                  : t('profile.blocked.manage')
              }
              onClick={() => setListeBloques((ouverte) => !ouverte)}
            />

            {listeBloques ? (
              <div className={styles.sousListe}>
                {bloques.length === 0 ? (
                  <p className={styles.sousTexte}>{t('common.notProvided')}</p>
                ) : (
                  bloques.map((bloque) => (
                    <div key={bloque.id} className={styles.bloque}>
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

                      <span className={styles.bloqueNom}>
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
            ) : null}
          </Carte>

          <Carte titre={t('profile.settings.preferences')}>
            <Ligne
              Icone={Heart}
              libelle={t('profile.settings.managePreferences')}
              valeur={t('profile.settings.customize')}
              href="/account/preferences"
            />

            <LigneChoix
              Icone={Languages}
              libelle={t('profile.settings.language')}
            >
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
            </LigneChoix>

            <LigneChoix Icone={Coins} libelle={t('profile.settings.currency')}>
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
            </LigneChoix>

            <LigneChoix
              Icone={Ruler}
              libelle={t('profile.settings.distanceUnit')}
            >
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
            </LigneChoix>
          </Carte>

          <Carte titre={t('profile.settings.assistance')}>
            <Ligne
              Icone={CircleHelp}
              libelle={t('profile.settings.helpCenter')}
              href="/account/support"
            />

            <Ligne
              Icone={LifeBuoy}
              libelle={t('profile.settings.contactSupport')}
              href="/account/support"
            />

            <Ligne
              Icone={Flag}
              libelle={t('profile.settings.problemReport')}
              href="/account/support?sujet=technical"
            />
          </Carte>

          <Carte titre={t('profile.settings.legal')}>
            <Ligne
              Icone={FileText}
              libelle={t('profile.settings.termsOfService')}
              href={`${SITE_URL}/conditions.html`}
              externe
            />

            <Ligne
              Icone={Shield}
              libelle={t('profile.settings.privacyPolicy')}
              href={`${SITE_URL}/confidentialite.html`}
              externe
            />
          </Carte>

          <Carte titre={t('profile.settings.myData')}>
            <Ligne
              Icone={Download}
              libelle={t('profile.settings.exportData')}
              valeur={exporte ? profil.email : undefined}
              onClick={exporte ? undefined : demanderMesDonnees}
            />

            {exporte ? (
              <div className={styles.sousListe}>
                <p className={styles.sousTexte}>
                  {t('profile.settings.exportRequested')}
                </p>
              </div>
            ) : null}
          </Carte>

          <Carte titre={t('profile.settings.dangerZone')}>
            <Ligne
              Icone={LogOut}
              libelle={t('profile.logout')}
              onClick={seDeconnecter}
              danger
            />

            <Ligne
              Icone={Trash2}
              libelle={t('profile.settings.deleteAccount')}
              onClick={() => setConfirmation(1)}
              danger
            />

            {confirmation === 1 ? (
              <div className={styles.sousListe}>
                <p className={styles.sousTexte}>
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
              <div className={styles.sousListe}>
                <p className={styles.sousTitre}>
                  {t('profile.settings.deleteAccountLastTitle')}
                </p>

                <p className={styles.sousTexte}>
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
          </Carte>
        </div>
      </div>
    </div>
  );
}
