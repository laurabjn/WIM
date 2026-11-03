import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Home, Review } from '@wim/shared/home/home.type';
import { BadgeCheck, ChevronRight, Star } from 'lucide-react';

import { DemandeEchange } from 'app/exchange/ui/DemandeEchange';

import styles from './HomeDetail.module.css';

type Props = {
  home: Home;
  locale: string;
};

const PHOTOS_MOSAIQUE = 6;
const AVIS_VISIBLES = 4;

function anneesDepuis(date?: string | null) {
  if (!date) return null;

  const debut = new Date(date);

  if (Number.isNaN(debut.getTime())) return null;

  const annees = Math.floor(
    (Date.now() - debut.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  return annees > 0 ? annees : null;
}

function moyenne(avis: Review[]) {
  if (avis.length === 0) return null;

  const total = avis.reduce((somme, un) => somme + un.score, 0);

  return (total / avis.length).toFixed(1);
}

export async function HomeDetail({ home, locale }: Props) {
  const t = await getTranslations();

  const photos = home.photos ?? [];
  const couverture = photos[0]?.url;
  const secondaires = photos.slice(1, 1 + PHOTOS_MOSAIQUE);

  const colonnesSecondaires = Math.min(3, Math.ceil(secondaires.length / 2));
  const lignesSecondaires = secondaires.length > colonnesSecondaires ? 2 : 1;

  const avis = home.reviews ?? [];
  const note = moyenne(avis);
  const nombreAvis = home.reviewsCount ?? avis.length;

  const anneesHote = anneesDepuis(home.owner?.createdAt);

  const dateCourte = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className={styles.page}>
      <header className={styles.entete}>
        <h1 className={styles.titre}>{home.title}</h1>
      </header>

      {couverture ? (
        <div
          className={styles.galerie}
          style={
            secondaires.length === 0
              ? { gridTemplateColumns: 'minmax(0, 1fr)' }
              : undefined
          }
        >
          <div className={styles.photoPrincipale}>
            <Image src={couverture} alt={home.title} fill sizes="50vw" />
          </div>

          {secondaires.length ? (
            <div
              className={styles.photosSecondaires}
              style={{
                gridTemplateColumns: `repeat(${colonnesSecondaires}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${lignesSecondaires}, minmax(0, 1fr))`,
              }}
            >
              {secondaires.map((photo) => (
                <div key={photo.id} className={styles.photoSecondaire}>
                  <Image src={photo.url} alt={home.title} fill sizes="20vw" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.colonnes}>
        <div className={styles.principal}>
          <section className={styles.bloc}>
            <h2 className={styles.lieu}>
              {home.city}, {home.country}
            </h2>

            <p className={styles.caracteristiques}>
              {home.capacity}{' '}
              {home.capacity > 1 ? t('home.travelers') : t('home.traveler')} •{' '}
              {home.beds} {home.beds > 1 ? t('profile.beds') : t('profile.bed')}
            </p>

            {note ? (
              <p className={styles.note}>
                <Star size={15} fill="currentColor" strokeWidth={0} /> {note} •{' '}
                {nombreAvis} {t('home.reviews.reviewsCount')}
              </p>
            ) : null}
          </section>

          {home.owner ? (
            <section className={styles.blocHote}>
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

                <span className={styles.hoteTextes}>
                  <span className={styles.hoteNom}>
                    {t('home.host')} : {home.owner.firstName}
                    {home.owner.identityVerified ? (
                      <BadgeCheck size={16} strokeWidth={2.4} />
                    ) : null}
                  </span>

                  {anneesHote ? (
                    <span className={styles.hoteDepuis}>
                      {t('home.hostSinceLabel')} {anneesHote} {t('home.years')}
                    </span>
                  ) : null}
                </span>
              </Link>
            </section>
          ) : null}

          {home.description ? (
            <section className={styles.bloc}>
              <h2 className={styles.sousTitre}>{t('home.description')}</h2>
              <p className={styles.description}>{home.description}</p>
            </section>
          ) : null}

          {home.carExchangeAccepted && home.vehicle ? (
            <section className={styles.bloc}>
              <div className={styles.voiture}>
                {home.vehicle.imageUrl ? (
                  <div className={styles.voiturePhoto}>
                    <Image
                      src={home.vehicle.imageUrl}
                      alt={home.vehicle.model ?? ''}
                      fill
                      sizes="140px"
                    />
                  </div>
                ) : null}

                <div className={styles.voitureTextes}>
                  <span className={styles.voitureTitre}>
                    {t('home.vehicule.exchangeAccepted')}
                  </span>

                  <span className={styles.voitureDetail}>
                    {[
                      home.vehicle.seats
                        ? `${home.vehicle.seats} ${t('home.vehicule.places')}`
                        : null,
                      home.vehicle.type,
                      home.vehicle.fuelType
                        ? t(`home.vehicule.fuelType.${home.vehicle.fuelType}`)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </span>

                  <span className={styles.voitureDetail}>
                    {[home.vehicle.brand, home.vehicle.model]
                      .filter(Boolean)
                      .join(' ')}
                  </span>
                </div>

                <ChevronRight size={20} className={styles.voitureChevron} />
              </div>
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

          {avis.length ? (
            <section className={styles.bloc}>
              <h2 className={styles.sousTitre}>
                <Star size={16} fill="currentColor" strokeWidth={0} /> {note} •{' '}
                {nombreAvis} {t('home.reviews.reviewsCount')}
              </h2>

              <div className={styles.avis}>
                {avis.slice(0, AVIS_VISIBLES).map((un) => (
                  <article key={un.id} className={styles.avisCarte}>
                    <p className={styles.avisEntete}>
                      {'★'.repeat(Math.round(un.score))} ·{' '}
                      {dateCourte.format(new Date(un.createdAt))}
                    </p>

                    <p className={styles.avisTexte}>{un.comment}</p>

                    <div className={styles.avisAuteur}>
                      {un.author.avatarUrl ? (
                        <Image
                          src={un.author.avatarUrl}
                          alt={un.author.firstName ?? ''}
                          width={32}
                          height={32}
                          className={styles.avatar}
                        />
                      ) : null}

                      <span>{un.author.firstName}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {home.owner ? (
            <section className={styles.bloc}>
              <h2 className={styles.sousTitre}>{t('home.meetHosts')}</h2>

              <div className={styles.rencontre}>
                <div className={styles.carteHote}>
                  {home.owner.avatarUrl ? (
                    <Image
                      src={home.owner.avatarUrl}
                      alt={home.owner.firstName}
                      width={72}
                      height={72}
                      className={styles.avatarGrand}
                    />
                  ) : null}

                  <span className={styles.hoteNom}>{home.owner.firstName}</span>
                  <span className={styles.hoteDepuis}>{t('home.host')}</span>

                  <dl className={styles.statistiques}>
                    <div>
                      <dt>{nombreAvis}</dt>
                      <dd>{t('home.reviews.reviewsCount')}</dd>
                    </div>

                    {home.owner.rating ? (
                      <div>
                        <dt>{home.owner.rating.toFixed(1)} ★</dt>
                        <dd>{t('home.overallRating')}</dd>
                      </div>
                    ) : null}

                    {anneesHote ? (
                      <div>
                        <dt>{anneesHote}</dt>
                        <dd>{t('home.years')}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className={styles.rencontreTextes}>
                  <h3 className={styles.sousTitre}>{t('home.hostInfo')}</h3>

                  <Link
                    href={`/profile?userId=${home.ownerId}`}
                    className={styles.boutonSombre}
                  >
                    {t('home.sendMessageAction')}
                  </Link>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <aside className={styles.colonneLaterale}>
          <DemandeEchange homeId={home.id} ownerId={home.ownerId} />
        </aside>
      </div>
    </article>
  );
}
