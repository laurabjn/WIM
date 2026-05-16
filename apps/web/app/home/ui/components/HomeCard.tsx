import { Home } from '@wim/shared/home/home.type';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import styles from './HomeCard.module.css';

type Props = {
  home: Home;
};

export function HomeCard({ home }: Props) {
  const t = useTranslations();

  const coverUrl = home.photos?.[0]?.url ?? '/images/placeholder-home.jpg';

  return (
    <Link href={`/profile?userId=${home.ownerId}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={coverUrl}
          alt={home.title}
          fill
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>
          {home.city}, {home.country}
        </h3>

        <p className={styles.subtitle}>{home.title}</p>

        <p className={styles.details}>
          {home.capacity} {t('home.travelers')}
        </p>
      </div>
    </Link>
  );
}