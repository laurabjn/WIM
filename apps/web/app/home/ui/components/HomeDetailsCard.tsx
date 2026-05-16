'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Home } from '@wim/shared/home/home.type';
import styles from './HomeDetailsCard.module.css';
import { useTranslations } from 'next-intl';
import { MouseEvent, useState } from 'react';
import { addFavoriteHome, removeFavoriteHome } from 'app/home/infrastructure/home.api';
import { getSession } from 'app/auth/infrastructure/authStorage';

type Props = {
  home: Home;
};

export function HomeDetailsCard({ home }: Props) {
  const t = useTranslations();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  
  const coverUrl = home.photos?.[0]?.url || '/images/placeholder-home.jpg';
  const ownerAvatar = home.owner?.avatarUrl;

  async function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isUpdatingFavorite) return;

    const session = getSession();
    const token = session?.accessToken;

    if (!token) {
      console.log('Utilisateur non connecté');
      return;
    }

    const nextValue = !isFavorite;

    setIsFavorite(nextValue);
    setIsUpdatingFavorite(true);

    try {
      if (nextValue) {
        await addFavoriteHome(token, home.id);
      } else {
        await removeFavoriteHome(token, home.id);
      }
    } catch (error) {
      console.log('Favorite error:', error);
      setIsFavorite(!nextValue);
    } finally {
      setIsUpdatingFavorite(false);
    }
  }

  return (
    <Link href={`/homes/${home.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={coverUrl}
          alt={home.title}
          fill
          className={styles.image}
        />

        <button
          className={`${styles.favoriteButton} ${
            isFavorite ? styles.favoriteActive : ''
          }`}
          type="button"
          onClick={handleFavoriteClick}
          disabled={isUpdatingFavorite}
        >
          {isFavorite ? '★' : '☆'}
        </button>

        {ownerAvatar ? (
          <div className={styles.ownerAvatarWrapper}>
            <Image
              src={ownerAvatar}
              alt="Hôte"
              fill
              className={styles.ownerAvatar}
            />
          </div>
        ) : null}
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3>{home.title}</h3>
          <span>★ {(home.averageRating ?? 0).toFixed(1)} ({home.reviewsCount ?? 0})</span>
        </div>

        <p className={styles.location}>
          {home.city}, {home.country}
        </p>

        <p className={styles.details}>
          {home.capacity} {t('home.travelers')} • {home.beds} {t('home.beds')}
        </p>

        <div className={styles.bottomRow}>
          {home.isAvailableForExchange ? (
            <span className={styles.availableBadge}>{t('home.available')}</span>
          ) : (
            <span className={styles.unavailableBadge}>{t('home.unavailable')}</span>
          )}

          <span className={styles.price}>
            ✈ {t('home.from')} {home.pricePerNight ?? 0}€
          </span>
        </div>
      </div>
    </Link>
  );
}