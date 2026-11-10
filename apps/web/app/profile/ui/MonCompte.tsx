'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Home, UserProfile } from '@wim/shared';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Heart,
  LifeBuoy,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Sliders,
  type LucideIcon,
} from 'lucide-react';

import { clearSession, getSession } from 'app/auth/infrastructure/authStorage';
import { getMyHomes } from 'app/home/infrastructure/home.api';
import { HomeDetailsCard } from 'app/home/ui/components/HomeDetailsCard';
import { getMyProfile } from 'app/profile/infrastructure/profile.api';
import { ProfileCard } from 'app/profile/ui/components/ProfileCard';

import styles from './MonCompte.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

type Raccourci = { href: string; cle: string; Icone: LucideIcon };

const RACCOURCIS: Raccourci[] = [
  { href: '/favorites', cle: 'profile.favorites', Icone: Heart },
  { href: '/notifications', cle: 'notifications.title', Icone: Bell },
  { href: '/account/preferences', cle: 'profile.preferences', Icone: Sliders },
  { href: '/account/settings', cle: 'profile.parameters', Icone: Settings },
  {
    href: '/subscription',
    cle: 'profile.settings.subscription',
    Icone: CreditCard,
  },
  { href: '/account/support', cle: 'profile.help', Icone: LifeBuoy },
];

export function MonCompte() {
  const t = useTranslations();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [logements, setLogements] = useState<Home[]>([]);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    Promise.all([
      getMyProfile(session.accessToken),
      getMyHomes(session.accessToken).catch(() => []),
    ])
      .then(([mien, miens]) => {
        if (!actif) return;

        setProfil(mien);
        setLogements(miens);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

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

  return (
    <div className={styles.colonnes}>
      <div className={styles.colonneGauche}>
        <ProfileCard
          profile={profil}
          actions={
            <>
              <Link href="/account/edit" className={styles.boutonSombre}>
                <Pencil size={15} />
                {t('profile.editProfile.title')}
              </Link>

              <Link
                href={`/profile?userId=${profil.id}`}
                className={styles.boutonClair}
              >
                {t('profile.publicProfile')}
              </Link>
            </>
          }
        />

        <nav className={styles.carte}>
          {RACCOURCIS.map(({ href, cle, Icone }) => (
            <Link key={href} href={href} className={styles.ligne}>
              <Icone size={18} className={styles.icone} />

              <span className={styles.libelle}>{t(cle)}</span>

              <ChevronRight size={18} className={styles.chevron} />
            </Link>
          ))}

          <button
            type="button"
            className={`${styles.ligne} ${styles.ligneDanger}`}
            onClick={seDeconnecter}
          >
            <LogOut size={18} className={styles.icone} />

            <span className={styles.libelle}>{t('profile.logout')}</span>

            <ChevronRight size={18} className={styles.chevron} />
          </button>
        </nav>
      </div>

      <div className={styles.colonneDroite}>
        <div className={styles.sectionEntete}>
          <h2 className={styles.sectionTitre}>{t('profile.homes')}</h2>

          <Link href="/homes/new" className={styles.boutonClair}>
            <Plus size={15} />
            {t('profile.addHome')}
          </Link>
        </div>

        {logements.length === 0 ? (
          <p className={styles.vide}>{t('profile.noHomes')}</p>
        ) : (
          logements.map((logement) => (
            <HomeDetailsCard key={logement.id} home={logement} />
          ))
        )}
      </div>
    </div>
  );
}
