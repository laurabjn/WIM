'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import Link from 'next/link';
import {
  Home,
  Repeat,
  MessageSquare,
  User,
  Search,
} from 'lucide-react';

const ENTREES = [
  { chemin: '/menu', cle: 'home', Icone: Home },
  { chemin: '/exchanges', cle: 'exchanges', Icone: Repeat },
  { chemin: '/messages', cle: 'messages', Icone: MessageSquare },
  { chemin: '/account', cle: 'account', Icone: User },
] as const;

export function Navbar() {
  const t = useTranslations('common');
  const chemin = usePathname() ?? '';
  const sansLangue = chemin.replace(/^\/(fr|en)(?=\/|$)/, '') || '/';

  function estActive(cible: string) {
    return sansLangue === cible || sansLangue.startsWith(`${cible}/`);
  }

  return (
    <nav className={styles.navbar}>
      {ENTREES.map(({ chemin: cible, cle, Icone }) => (
        <Link
          key={cible}
          href={cible}
          aria-current={estActive(cible) ? 'page' : undefined}
          className={[
            styles.navItem,
            estActive(cible) ? styles.navItemActif : '',
          ].join(' ')}
        >
          <Icone size={15} strokeWidth={2.2} />
          {t(cle)}
        </Link>
      ))}

      <Link href="/search" className={styles.searchButton}>
        <Search size={15} strokeWidth={2.4} />
        {t('search')}
      </Link>
    </nav>
  );
}
