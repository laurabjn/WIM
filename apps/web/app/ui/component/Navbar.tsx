import { useTranslations } from 'next-intl';
import styles from './Navbar.module.css';
import Link from 'next/link';
import {
  Home,
  Repeat,
  MessageSquare,
  User,
  Search,
} from 'lucide-react';

export function Navbar() {
  const t = useTranslations('common');
  return (
    <nav className={styles.navbar}>
      <Link href="/menu" className={styles.navItem}>
        <Home size={15} strokeWidth={2.2} />
        {t('home')}
      </Link>
      <Link href="/exchanges" className={styles.navItem}>
        <Repeat size={15} strokeWidth={2.2} />
        {t('exchanges')}
      </Link>
      <Link href="/messages" className={styles.navItem}>
        <MessageSquare size={15} strokeWidth={2.2} />
        {t('messages')}
      </Link>
      <Link href="/profile" className={styles.navItem}>
        <User size={15} strokeWidth={2.2} />
        {t('account')}
      </Link>
      <Link href="/search" className={styles.searchButton}>
        <Search size={15} strokeWidth={2.4} />
        {t('search')}
      </Link>
    </nav>
  );
}