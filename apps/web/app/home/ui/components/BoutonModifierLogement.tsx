'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';

import { getSession } from 'app/auth/infrastructure/authStorage';
import styles from './BoutonRond.module.css';

type Props = {
  homeId: string;
  ownerId: string;
};

export function BoutonModifierLogement({ homeId, ownerId }: Props) {
  const t = useTranslations('common');
  const [estLeMien, setEstLeMien] = useState(false);

  useEffect(() => {
    setEstLeMien(getSession()?.user.id === ownerId);
  }, [ownerId]);

  if (!estLeMien) return null;

  return (
    <Link
      href={`/homes/${homeId}/edit`}
      className={styles.rond}
      title={t('edit')}
      aria-label={t('edit')}
    >
      <Pencil size={18} />
    </Link>
  );
}
