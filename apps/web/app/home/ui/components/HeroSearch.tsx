import { Home } from '@wim/shared/home/home.type';
import { useTranslations } from 'next-intl';
import styles from './HeroSearch.module.css';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  home: Home;
  nombreLogements: number;
};

export function HeroSearch({ home, nombreLogements }: Props) {
  const t = useTranslations();

  const coverUrl =
    home.photos?.[0]?.url ?? '/images/placeholder-home.jpg';

  return (
    <article className={styles.heroSearch}>
      <Image
        src={coverUrl}
        alt={home.city}
        fill
        className={styles.heroImage}
        priority
      />

      <div className={styles.heroOverlay}>
        <h1 className={styles.title}>
          {home.city.toUpperCase()}
        </h1>

        <div className={styles.bottomRow}>
          <div>
            <span className={styles.exchangeLabel}>
              {t('search.nbExchanges')}
            </span>

            <strong className={styles.exchangeCount}>
              {nombreLogements}
            </strong>
          </div>

          <Link
            href={`/homes/${home.id}`}
            className={styles.moreButton}
          >
            {t('common.seeMore')}
            <span aria-hidden="true">&#8594;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}