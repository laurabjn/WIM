'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Home, UserProfile } from '@wim/shared';
import {
  BadgeCheck,
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
  Star,
  type LucideIcon,
} from 'lucide-react';

import { clearSession, getSession } from 'app/auth/infrastructure/authStorage';
import { getMyHomes } from 'app/home/infrastructure/home.api';
import { HomeDetailsCard } from 'app/home/ui/components/HomeDetailsCard';
import { getMyProfile } from 'app/profile/infrastructure/profile.api';

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

function age(naissance: string | null): number | null {
  if (!naissance) return null;

  const jour = new Date(naissance);

  if (Number.isNaN(jour.getTime())) return null;

  const aujourdhui = new Date();
  const ecart = aujourdhui.getFullYear() - jour.getFullYear();
  const passe =
    aujourdhui.getMonth() > jour.getMonth() ||
    (aujourdhui.getMonth() === jour.getMonth() &&
      aujourdhui.getDate() >= jour.getDate());

  return passe ? ecart : ecart - 1;
}

export function MonCompte() {
  const t = useTranslations();
  const locale = useLocale();
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

  const nom = [profil.firstName, profil.lastName].filter(Boolean).join(' ');
  const ans = age(profil.birthDate);
  const note = profil.averageRating ?? 0;
  const commentaires = profil.reviewsCount ?? 0;
  const langues = profil.languages ?? [];

  const chiffres = [
    { valeur: profil.homesCount ?? logements.length, libelle: 'profile.homes' },
    { valeur: profil.exchangesCount ?? 0, libelle: 'profile.exchanges' },
    { valeur: commentaires, libelle: 'profile.reviews' },
  ];

  return (
    <div className={styles.colonnes}>
      <div className={styles.colonne}>
        <section className={styles.profil}>
          <div className={styles.entete}>
            <span className={styles.avatar}>
              {profil.avatarUrl ? (
                <Image
                  src={profil.avatarUrl}
                  alt={nom}
                  fill
                  sizes="96px"
                  className={styles.avatarImage}
                />
              ) : (
                (profil.firstName?.[0] ?? '?').toUpperCase()
              )}
            </span>

            <div className={styles.identite}>
              <h2 className={styles.nom}>
                {nom}

                {profil.identityVerified ? (
                  <BadgeCheck
                    size={20}
                    className={styles.verifie}
                    aria-label={t('profile.identityVerified')}
                  />
                ) : null}
              </h2>

              {ans !== null ? (
                <p className={styles.age}>
                  {ans} {t('profile.years')}
                </p>
              ) : null}

              <p className={styles.note}>
                <Star size={15} className={styles.etoile} />

                {note.toLocaleString(locale, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}

                <span className={styles.commentaires}>
                  ({commentaires} {t('profile.reviews')})
                </span>
              </p>
            </div>

            <div className={styles.actions}>
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
            </div>
          </div>

          {profil.bio ? <p className={styles.bio}>{profil.bio}</p> : null}

          {langues.length > 0 ? (
            <div className={styles.groupe}>
              <h3 className={styles.groupeTitre}>
                {t('profile.editProfile.languages')}
              </h3>

              <ul className={styles.pilules}>
                {langues.map((langue) => {
                  const cle = `profile.language.${langue}`;

                  return (
                    <li key={langue} className={styles.pilule}>
                      {t.has(cle) ? t(cle) : langue}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <dl className={styles.chiffres}>
            {chiffres.map((chiffre) => (
              <div key={chiffre.libelle} className={styles.chiffre}>
                <dt className={styles.chiffreValeur}>{chiffre.valeur}</dt>

                <dd className={styles.chiffreLibelle}>{t(chiffre.libelle)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section}>
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
            <div className={styles.grille}>
              {logements.map((logement) => (
                <HomeDetailsCard key={logement.id} home={logement} />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className={styles.colonne}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitre}>{t('profile.shortcuts')}</h2>

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
        </section>
      </div>
    </div>
  );
}
