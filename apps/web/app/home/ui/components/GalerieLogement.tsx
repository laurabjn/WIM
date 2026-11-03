'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HomePhoto } from '@wim/shared/home/home.type';

import styles from './GalerieLogement.module.css';

const MARGE_DE_FIN = 8;
const PART_DEFILEE = 0.7;

type Props = {
  photos: HomePhoto[];
  titre: string;
};

export function GalerieLogement({ photos, titre }: Props) {
  const t = useTranslations('home');

  const rail = useRef<HTMLDivElement>(null);
  const [aGauche, setAGauche] = useState(false);
  const [aDroite, setADroite] = useState(false);

  const couverture = photos[0];
  const secondaires = photos.slice(1);

  useEffect(() => {
    const element = rail.current;

    if (!element) return;

    function mesurer() {
      if (!element) return;

      const restant =
        element.scrollWidth - element.clientWidth - element.scrollLeft;

      setAGauche(element.scrollLeft > MARGE_DE_FIN);
      setADroite(restant > MARGE_DE_FIN);
    }

    mesurer();

    element.addEventListener('scroll', mesurer);
    window.addEventListener('resize', mesurer);

    return () => {
      element.removeEventListener('scroll', mesurer);
      window.removeEventListener('resize', mesurer);
    };
  }, [secondaires.length]);

  function defiler(sens: number) {
    const element = rail.current;

    if (!element) return;

    element.scrollBy({
      left: sens * element.clientWidth * PART_DEFILEE,
      behavior: 'smooth',
    });
  }

  if (!couverture) return null;

  return (
    <div className={secondaires.length ? styles.galerie : styles.galerieSeule}>
      <div className={styles.photoPrincipale}>
        <Image src={couverture.url} alt={titre} fill sizes="50vw" priority />
      </div>

      {secondaires.length ? (
        <div className={styles.bande}>
          <div className={styles.rail} ref={rail}>
            {secondaires.map((photo) => (
              <div key={photo.id} className={styles.vignette}>
                <Image src={photo.url} alt={titre} fill sizes="20vw" />
              </div>
            ))}
          </div>

          {aGauche ? (
            <button
              type="button"
              className={`${styles.fleche} ${styles.flechePrecedent}`}
              onClick={() => defiler(-1)}
              aria-label={t('previousPhotos')}
            >
              <ChevronLeft size={22} />
            </button>
          ) : null}

          {aDroite ? (
            <button
              type="button"
              className={`${styles.fleche} ${styles.flecheSuivant}`}
              onClick={() => defiler(1)}
              aria-label={t('nextPhotos')}
            >
              <ChevronRight size={22} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
