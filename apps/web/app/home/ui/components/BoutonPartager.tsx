'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';

import styles from './BoutonRond.module.css';

type Props = {
  titre: string;
};

export function BoutonPartager({ titre }: Props) {
  const t = useTranslations('common');
  const [copie, setCopie] = useState(false);

  async function partager() {
    const lien = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: titre, url: lien });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(lien);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      return;
    }
  }

  return (
    <button
      type="button"
      className={styles.rond}
      onClick={partager}
      title={copie ? t('linkCopied') : t('share')}
      aria-label={copie ? t('linkCopied') : t('share')}
    >
      <Share2 size={18} />
    </button>
  );
}
