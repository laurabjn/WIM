import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Home } from '@wim/shared/home/home.type';
import { BadgeCheck, MapPin, Star } from 'lucide-react';

import styles from './HomeDetail.module.css';

type Props = {
  home: Home;
  locale: string;
};

function formatPeriode(debut: string, fin: string, locale: string) {
  const format = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${format.format(new Date(debut))} — ${format.format(new Date(fin))}`;
}

export async function HomeDetail({ home, locale }: Props) {
  const t = await getTranslations();

  const photos = home.photos ?? [];
  const couverture = photos[0]?.url;
  const secondaires = photos.slice(1, 5);

  const disponibilites = (home.availabilities ?? []).filter(
    (periode) => new Date(periode.endDate).getTime() >= Date.now(),
  );

  const voyageurs =
    home.capacity > 1 ? t('home.travelers') : t('home.traveler');

  const lits = home.beds > 1 ? t('profile.beds') : t('profile.bed');

  const sallesDeBain =
    home.bathrooms > 1 ? t('profile.bathrooms') : t('profile.bathroom');

  return (
    <article className={styles.fiche}>
      {couverture ? (
        <section className={styles.galerie}>
          <div className={styles.photoPrincipale}>
            <Image
              src={couverture}
              alt={home.title}
              fill
              sizes="(max-width: 900px) 100vw, 60vw"
              priority
            />
          </div>

          {secondaires.length > 0 ? (
            <div className={styles.photosSecondaires}>
              {secondaires.map((photo, index) => (
                <div key={photo.url} className={styles.photoSecondaire}>
                  <Image
                    src={photo.url}
                    alt={`${home.title} — ${index + 2}`}
                    fill
                    sizes="(max-width: 900px) 50vw, 20vw"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <header className={styles.entete}>
        <h1 className={styles.titre}>{home.title}</h1>

        <p className={styles.lieu}>
          <MapPin size={16} strokeWidth={2.2} />
          {home.city}, {home.country}
        </p>

        <p className={styles.caracteristiques}>
          {home.capacity} {voyageurs} · {home.beds} {lits} ·{' '}
          {home.bathrooms} {sallesDeBain}
        </p>

        {typeof home.averageRating === 'number' ? (
          <p className={styles.note}>
            <Star size={15} strokeWidth={2.4} />
            {home.averageRating.toFixed(1)}
            {home.reviewsCount ? ` · ${home.reviewsCount}` : ''}
          </p>
        ) : null}
      </header>

      {disponibilites.length > 0 ? (
        <section className={styles.bloc}>
          <h2 className={styles.sousTitre}>{t('home.availabilityTitle')}</h2>

          <ul className={styles.periodes}>
            {disponibilites.map((periode) => (
              <li key={periode.id ?? periode.startDate}>
                {formatPeriode(periode.startDate, periode.endDate, locale)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {home.description ? (
        <section className={styles.bloc}>
          <h2 className={styles.sousTitre}>{t('home.description')}</h2>
          <p className={styles.description}>{home.description}</p>
        </section>
      ) : null}

      {home.amenities?.length ? (
        <section className={styles.bloc}>
          <h2 className={styles.sousTitre}>{t('home.amenitiesTitle')}</h2>

          <ul className={styles.equipements}>
            {home.amenities.map((equipement) => {
              const cle = `home.amenities.${equipement}`;

              return (
                <li key={equipement} className={styles.equipement}>
                  {t.has(cle) ? t(cle) : equipement}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {home.owner ? (
        <section className={styles.bloc}>
          <h2 className={styles.sousTitre}>{t('home.host')}</h2>

          <Link
            href={`/profile?userId=${home.ownerId}`}
            className={styles.hote}
          >
            {home.owner.avatarUrl ? (
              <Image
                src={home.owner.avatarUrl}
                alt={home.owner.firstName}
                width={48}
                height={48}
                className={styles.avatar}
              />
            ) : null}

            <span className={styles.hoteNom}>
              {home.owner.firstName}
              {home.owner.identityVerified ? (
                <BadgeCheck size={16} strokeWidth={2.4} />
              ) : null}
            </span>
          </Link>
        </section>
      ) : null}

      <aside className={styles.appel}>
        <p className={styles.appelTexte}>{t('home.shareCtaText')}</p>

        <Link href="/register" className={styles.appelBouton}>
          {t('home.shareCtaButton')}
        </Link>
      </aside>
    </article>
  );
}
