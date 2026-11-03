import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Home, Review } from '@wim/shared/home/home.type';
import { CalendarDays, ChevronRight, Star } from 'lucide-react';

import { DemandeEchange } from 'app/exchange/ui/DemandeEchange';
import { CarteLogement } from 'app/home/ui/components/CarteLogement';
import { carteEstConfiguree } from 'app/home/infrastructure/mapbox';
import { getDescriptionDeVille } from 'app/home/infrastructure/locationDescription.api';
import { BoutonModifierLogement } from 'app/home/ui/components/BoutonModifierLogement';
import { iconeEquipement } from 'app/home/ui/components/iconesEquipements';
import { BoutonFavori } from 'app/home/ui/components/BoutonFavori';
import { BoutonPartager } from 'app/home/ui/components/BoutonPartager';
import { GalerieLogement } from 'app/home/ui/components/GalerieLogement';
import { VisiblePourLesAutres } from 'app/home/ui/components/VisiblePourLesAutres';

import styles from './HomeDetail.module.css';

type Props = {
  home: Home;
  locale: string;
};

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

  const avis = home.reviews ?? [];
  const note =
    home.averageRating != null ? home.averageRating.toFixed(1) : moyenne(avis);
  const nombreAvis = home.reviewsCount ?? avis.length;

  const anneesHote = anneesDepuis(home.owner?.createdAt);

  const disponibilites = (home.availabilities ?? [])
    .filter((periode) => new Date(periode.endDate).getTime() >= Date.now())
    .sort(
      (une, autre) =>
        new Date(une.startDate).getTime() - new Date(autre.startDate).getTime(),
    );

  const minuscules = (texte: string) => texte.toLocaleLowerCase(locale);

  const cleType = `home.homeTypes.${(home.homeType ?? '').toLowerCase()}`;
  const typeLogement = t.has(cleType) ? t(cleType) : '';

  const caracteristiques = [
    `${home.capacity} ${home.capacity > 1 ? t('home.travelers') : t('home.traveler')}`,
    typeLogement,
    home.beds
      ? `${home.beds} ${minuscules(home.beds > 1 ? t('profile.beds') : t('profile.bed'))}`
      : '',
    home.bathrooms
      ? `${home.bathrooms} ${minuscules(home.bathrooms > 1 ? t('profile.bathrooms') : t('profile.bathroom'))}`
      : '',
  ]
    .filter(Boolean)
    .join(' • ');

  const aDesCoordonnees =
    typeof home.latitude === 'number' && typeof home.longitude === 'number';

  const presentation = await getDescriptionDeVille(
    home.city,
    home.country,
    locale,
  );

  const dateCourte = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className={styles.page}>
      <header className={styles.entete}>
        <h1 className={styles.titre}>{home.title}</h1>

        <div className={styles.actions}>
          <BoutonPartager titre={home.title} />

          <BoutonFavori homeId={home.id} ownerId={home.ownerId} />

          <BoutonModifierLogement homeId={home.id} ownerId={home.ownerId} />
        </div>
      </header>

      <GalerieLogement photos={photos} titre={home.title} />

      <div className={styles.colonnes}>
        <div className={styles.principal}>
          <section className={styles.bloc}>
            <h2 className={styles.lieu}>
              {t('home.entireHome')}
              {typeLogement ? ` : ${minuscules(typeLogement)}` : ''} -{' '}
              {home.city}, {home.country}
            </h2>

            <p className={styles.caracteristiques}>{caracteristiques}</p>

            {note ? (
              <a className={styles.note} href="#avis">
                <Star size={15} fill="currentColor" strokeWidth={0} /> {note} •{' '}
                <span className={styles.noteLien}>
                  {nombreAvis} {t('home.reviews.reviewsCount')}
                </span>
              </a>
            ) : null}
          </section>

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
                  const libelle = t.has(cle) ? t(cle) : equipement;
                  const Icone = iconeEquipement(libelle);

                  return (
                    <li key={equipement} className={styles.equipement}>
                      <Icone size={20} strokeWidth={1.8} />
                      {libelle}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {aDesCoordonnees && carteEstConfiguree ? (
            <section className={styles.bloc}>
              <h2 className={styles.sousTitre}>{t('home.whereIsHome')}</h2>

              <CarteLogement
                latitude={home.latitude as number}
                longitude={home.longitude as number}
                legende={`${home.city}, ${home.country}`}
              />

              <p className={styles.mention}>{t('home.exactAddressLater')}</p>

              <h3 className={styles.lieu}>
                {home.city}, {home.country}
              </h3>

              {presentation?.extract ? (
                <>
                  <p className={styles.extrait}>{presentation.extract}</p>

                  {presentation.pageUrl ? (
                    <a
                      className={styles.lienSource}
                      href={presentation.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('home.readMore')}
                    </a>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : null}

          {avis.length ? (
            <section className={styles.bloc} id="avis">
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
            <VisiblePourLesAutres ownerId={home.ownerId}>
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
            </VisiblePourLesAutres>
          ) : null}
        </div>

        <aside className={styles.colonneLaterale}>
          <div className={styles.resume}>
            <span className={styles.resumeTitre}>
              {t('home.availabilityTitle')}
            </span>

            {disponibilites.length ? (
              <ul className={styles.periodes}>
                {disponibilites.map((periode) => (
                  <li
                    key={periode.id ?? periode.startDate}
                    className={styles.disponibilite}
                  >
                    <CalendarDays size={16} />
                    {dateCourte.format(new Date(periode.startDate))} —{' '}
                    {dateCourte.format(new Date(periode.endDate))}
                  </li>
                ))}
              </ul>
            ) : (
              <span className={styles.disponibilite}>
                <CalendarDays size={16} />
                {t('availability.free')}
              </span>
            )}
          </div>

          <DemandeEchange homeId={home.id} ownerId={home.ownerId} />
        </aside>
      </div>
    </article>
  );
}
