import Image from 'next/image';
import styles from './ProfileCard.module.css';
import { useTranslations } from 'next-intl';

type Profile = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  birthDate?: string | null;
  languages?: string[] | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  exchangesCount?: number | null;
  homesCount?: number | null;
};

type Props = {
  profile: Profile;
};

function calculateAge(birthDate?: string | null) {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) age--;

  return age;
}

export function ProfileCard({ profile }: Props) {
  const t = useTranslations();

  const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  const age = calculateAge(profile.birthDate);
  const rating = profile.averageRating ?? 0;
  const reviewsCount = profile.reviewsCount ?? 0;
  const exchangesCount = profile.exchangesCount ?? 0;
  const languages = profile.languages ?? [];

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.identity}>
          <div className={styles.avatarWrapper}>
            <Image
              src={profile.avatarUrl || '/images/default-avatar.png'}
              alt={fullName || 'Utilisateur'}
              fill
              className={styles.avatar}
            />

            <span className={styles.exchangeBadge}>♙</span>
          </div>

          <div>
            <div className={styles.nameRow}>
              <h1>{fullName || 'Utilisateur'}</h1>
              <span className={styles.verified}>✓</span>
            </div>

            {age ? <p className={styles.age}>{age} {t('profile.years')}</p> : null}

            <p className={styles.rating}>
              ★ {rating.toFixed(1)} ({reviewsCount} {t('profile.reviews')})
            </p>
          </div>
        </div>
      </div>

      {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : null}

      {languages.length > 0 ? (
        <div className={styles.languageRow}>
          {languages.map((language) => (
            <span key={language} className={styles.languagePill}>
              {language}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.separator} />

      <div className={styles.statsRow}>
        <div>
          <strong>{exchangesCount}</strong>
          <span>{t('profile.exchanges')}</span>
        </div>

        <div>
          <strong>{reviewsCount}</strong>
          <span>{t('profile.reviews')}</span>
        </div>

        <div>
          <strong>{rating.toFixed(1)}</strong>
          <span>{t('profile.rate')}</span>
        </div>
      </div>
    </article>
  );
}