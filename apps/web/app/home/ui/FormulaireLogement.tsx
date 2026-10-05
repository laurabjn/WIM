'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { HOME_CATEGORIES, type Home } from '@wim/shared';
import { AMENITIES } from '@wim/shared/utils/amenities';
import type { HomeAvailability } from '@wim/shared/home/homeAvailability.type';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  ErreurLogement,
  addAvailability,
  createHome,
  deleteHome,
  getAvailabilities,
  getHomeById,
  removeAvailability,
  updateHome,
  uploadHomePhoto,
  type ChampsLogement,
} from 'app/home/infrastructure/home.api';

import styles from './FormulaireLogement.module.css';

type Props = {
  homeId?: string;
};

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

const TYPES = [
  'apartment',
  'house',
  'villa',
  'studio',
  'cottage',
  'loft',
  'other',
] as const;

export function FormulaireLogement({ homeId }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [logement, setLogement] = useState<Home | null>(null);
  const [periodes, setPeriodes] = useState<HomeAvailability[]>([]);

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [pays, setPays] = useState('');
  const [capacite, setCapacite] = useState('2');
  const [lits, setLits] = useState('1');
  const [chambres, setChambres] = useState('1');
  const [sallesDeBain, setSallesDeBain] = useState('1');
  const [type, setType] = useState<string>('apartment');
  const [categorie, setCategorie] = useState('');
  const [equipements, setEquipements] = useState<string[]>([]);
  const [disponible, setDisponible] = useState(true);
  const [prix, setPrix] = useState('');
  const [voiture, setVoiture] = useState(false);
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [places, setPlaces] = useState('');

  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [identiteRequise, setIdentiteRequise] = useState(false);
  const [confirmeSuppression, setConfirmeSuppression] = useState(false);

  const fichier = useRef<HTMLInputElement>(null);

  const dates = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  );

  function remplir(mien: Home) {
    setLogement(mien);
    setTitre(mien.title ?? '');
    setDescription(mien.description ?? '');
    setAdresse(mien.address ?? '');
    setVille(mien.city ?? '');
    setPays(mien.country ?? '');
    setCapacite(String(mien.capacity ?? 2));
    setLits(String(mien.beds ?? 1));
    setChambres(String(mien.bedrooms ?? 1));
    setSallesDeBain(String(mien.bathrooms ?? 1));
    setType(mien.homeType ?? 'apartment');
    setCategorie(mien.category ?? '');
    setEquipements(mien.amenities ?? []);
    setDisponible(mien.isAvailableForExchange !== false);
    setPrix(mien.pricePerNight ? String(mien.pricePerNight) : '');
    setVoiture(mien.carExchangeAccepted === true);
    setMarque(mien.vehicle?.brand ?? '');
    setModele(mien.vehicle?.model ?? '');
    setPlaces(mien.vehicle?.seats ? String(mien.vehicle.seats) : '');
  }

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    setToken(session.accessToken);

    if (!homeId) {
      setEtat('prete');

      return;
    }

    let actif = true;

    Promise.all([getHomeById(homeId), getAvailabilities(homeId).catch(() => [])])
      .then(([mien, liste]) => {
        if (!actif) return;

        remplir(mien);
        setPeriodes(liste);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, [homeId]);

  function champs(): ChampsLogement {
    return {
      title: titre.trim(),
      description: description.trim(),
      address: adresse.trim() || undefined,
      city: ville.trim(),
      country: pays.trim(),
      capacity: Number(capacite) || 1,
      beds: Number(lits) || 1,
      bedrooms: Number(chambres) || 1,
      bathrooms: Number(sallesDeBain) || 0,
      homeType: type,
      category:
        (HOME_CATEGORIES as readonly string[]).includes(categorie)
          ? (categorie as ChampsLogement['category'])
          : undefined,
      amenities: equipements,
      isAvailableForExchange: disponible,
      pricePerNight: prix ? Number(prix) : undefined,
      carExchangeAccepted: voiture,
      vehicle: voiture
        ? {
            brand: marque.trim() || undefined,
            model: modele.trim() || undefined,
            seats: places ? Number(places) : undefined,
          }
        : undefined,
    };
  }

  async function enregistrer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    if (!token || envoi) return;

    setEnvoi(true);
    setErreur(null);
    setIdentiteRequise(false);

    try {
      if (homeId) {
        remplir(await updateHome(token, homeId, champs()));
      } else {
        const cree = await createHome(token, champs());

        router.push(`/homes/${cree.id}/edit`);

        return;
      }
    } catch (souci) {
      if (
        souci instanceof ErreurLogement &&
        souci.code === 'IDENTITY_NOT_VERIFIED'
      ) {
        setIdentiteRequise(true);
      }

      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
    } finally {
      setEnvoi(false);
    }
  }

  async function ajouterUnePhoto(choisi: File | undefined) {
    if (!token || !homeId || !choisi) return;

    setErreur(null);

    try {
      remplir(await uploadHomePhoto(token, homeId, choisi));
    } catch (souci) {
      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
    }
  }

  async function ajouterUnePeriode() {
    if (!token || !homeId || !debut || !fin) return;

    setErreur(null);

    try {
      const periode = await addAvailability(token, homeId, {
        startDate: debut,
        endDate: fin,
        type: 'AVAILABLE',
      });

      setPeriodes((liste) => [...liste, periode]);
      setDebut('');
      setFin('');
    } catch (souci) {
      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
    }
  }

  async function retirerUnePeriode(availabilityId: string) {
    if (!token || !homeId) return;

    setErreur(null);

    try {
      await removeAvailability(token, homeId, availabilityId);
      setPeriodes((liste) =>
        liste.filter((periode) => periode.id !== availabilityId),
      );
    } catch (souci) {
      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
    }
  }

  async function supprimer() {
    if (!token || !homeId) return;

    setErreur(null);

    try {
      await deleteHome(token, homeId);
      router.push('/account');
    } catch (souci) {
      setErreur(
        souci instanceof Error ? souci.message : t('common.genericError'),
      );
    }
  }

  function basculerEquipement(equipement: string) {
    setEquipements((liste) =>
      liste.includes(equipement)
        ? liste.filter((element) => element !== equipement)
        : [...liste, equipement],
    );
  }

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('common.loading')}</p>;
  }

  if (etat === 'anonyme') {
    return (
      <div className={styles.etat}>
        <p>{t('common.signInRequired')}</p>

        <Link href="/login" className={styles.boutonSombre}>
          {t('common.signIn')}
        </Link>
      </div>
    );
  }

  if (etat === 'erreur') {
    return <p className={styles.etat}>{t('home.notFound')}</p>;
  }

  return (
    <form className={styles.formulaire} onSubmit={enregistrer}>
      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      {identiteRequise ? (
        <Link href="/account/settings" className={styles.boutonClair}>
          {t('auth.identity.gateAction')}
        </Link>
      ) : null}

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('home.descriptionTitle')}</h2>

        <label className={styles.champ}>
          <span className={styles.libelle}>{t('home.title')}</span>

          <input
            value={titre}
            onChange={(evenement) => setTitre(evenement.target.value)}
            required
          />
        </label>

        <label className={styles.champ}>
          <span className={styles.libelle}>{t('home.description')}</span>

          <textarea
            value={description}
            rows={5}
            placeholder={t('home.descriptionPlaceholder')}
            onChange={(evenement) => setDescription(evenement.target.value)}
            required
          />
        </label>

        <div className={styles.lignes}>
          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.homeType')}</span>

            <select
              value={type}
              onChange={(evenement) => setType(evenement.target.value)}
            >
              {TYPES.map((candidat) => (
                <option key={candidat} value={candidat}>
                  {t(`home.homeTypes.${candidat}`)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.category')}</span>

            <select
              value={categorie}
              onChange={(evenement) => setCategorie(evenement.target.value)}
            >
              <option value="">{t('search.allCategories')}</option>

              {HOME_CATEGORIES.map((candidat) => (
                <option key={candidat} value={candidat}>
                  {t(`search.category.${candidat.toLowerCase()}`)}
                </option>
              ))}
            </select>

            <span className={styles.aide}>{t('home.categoryHint')}</span>
          </label>
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('home.locationSectionTitle')}</h2>

        <label className={styles.champ}>
          <span className={styles.libelle}>{t('home.address')}</span>

          <input
            value={adresse}
            onChange={(evenement) => setAdresse(evenement.target.value)}
          />

          <span className={styles.aide}>{t('home.locationDescription')}</span>
        </label>

        <div className={styles.lignes}>
          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.city')}</span>

            <input
              value={ville}
              onChange={(evenement) => setVille(evenement.target.value)}
              required
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.country')}</span>

            <input
              value={pays}
              onChange={(evenement) => setPays(evenement.target.value)}
              required
            />
          </label>
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('home.howManyTravelers')}</h2>

        <div className={styles.lignes}>
          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.capacity')}</span>

            <input
              type="number"
              min={1}
              value={capacite}
              onChange={(evenement) => setCapacite(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.beds')}</span>

            <input
              type="number"
              min={1}
              value={lits}
              onChange={(evenement) => setLits(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('profile.bedrooms')}</span>

            <input
              type="number"
              min={1}
              value={chambres}
              onChange={(evenement) => setChambres(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.bathrooms')}</span>

            <input
              type="number"
              min={0}
              value={sallesDeBain}
              onChange={(evenement) => setSallesDeBain(evenement.target.value)}
            />
          </label>

          <label className={styles.champ}>
            <span className={styles.libelle}>{t('home.pricePerNight')}</span>

            <input
              type="number"
              min={0}
              value={prix}
              onChange={(evenement) => setPrix(evenement.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('home.amenitiesTitle')}</h2>

        <div className={styles.puces}>
          {AMENITIES.map((equipement) => (
            <button
              key={equipement}
              type="button"
              className={`${styles.puce} ${
                equipements.includes(equipement) ? styles.puceActive : ''
              }`.trim()}
              onClick={() => basculerEquipement(equipement)}
            >
              {t(`home.amenities.${equipement}`)}
            </button>
          ))}
        </div>

        <label className={styles.interrupteur}>
          <input
            type="checkbox"
            checked={disponible}
            onChange={(evenement) => setDisponible(evenement.target.checked)}
          />

          <span>
            {t('home.availableForExchange')}

            <span className={styles.aide}>
              {t('home.availableForExchangeDescription')}
            </span>
          </span>
        </label>

        <label className={styles.interrupteur}>
          <input
            type="checkbox"
            checked={voiture}
            onChange={(evenement) => setVoiture(evenement.target.checked)}
          />

          <span>{t('home.vehicule.exchangeAccepted')}</span>
        </label>

        {voiture ? (
          <div className={styles.lignes}>
            <label className={styles.champ}>
              <span className={styles.libelle}>
                {t('home.vehicule.brand')}
              </span>

              <input
                value={marque}
                onChange={(evenement) => setMarque(evenement.target.value)}
              />
            </label>

            <label className={styles.champ}>
              <span className={styles.libelle}>{t('home.vehicule.model')}</span>

              <input
                value={modele}
                onChange={(evenement) => setModele(evenement.target.value)}
              />
            </label>

            <label className={styles.champ}>
              <span className={styles.libelle}>
                {t('home.vehicule.places')}
              </span>

              <input
                type="number"
                min={1}
                value={places}
                onChange={(evenement) => setPlaces(evenement.target.value)}
              />
            </label>
          </div>
        ) : null}
      </section>

      <div className={styles.actions}>
        <Link href="/account" className={styles.boutonClair}>
          {t('common.cancel')}
        </Link>

        <button type="submit" className={styles.boutonSombre} disabled={envoi}>
          {t('common.save')}
        </button>
      </div>

      {homeId && logement ? (
        <>
          <section className={styles.bloc}>
            <h2 className={styles.blocTitre}>{t('home.homePhoto')}</h2>

            {logement.photos && logement.photos.length > 0 ? (
              <div className={styles.photos}>
                {logement.photos.map((photo) => (
                  <span key={photo.url} className={styles.photo}>
                    <Image
                      src={photo.url}
                      alt={logement.title}
                      fill
                      className={styles.photoImage}
                    />
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.aide}>{t('home.noPhotos')}</p>
            )}

            <input
              ref={fichier}
              className={styles.cache}
              type="file"
              accept="image/*"
              onChange={(evenement) =>
                ajouterUnePhoto(evenement.target.files?.[0])
              }
            />

            <button
              type="button"
              className={styles.boutonClair}
              onClick={() => fichier.current?.click()}
            >
              {t('home.addPhoto')}
            </button>
          </section>

          <section className={styles.bloc}>
            <h2 className={styles.blocTitre}>
              {t('home.availabilityPeriods')}
            </h2>

            <p className={styles.aide}>{t('home.availabilityPeriodsHint')}</p>

            {periodes.length === 0 ? (
              <p className={styles.aide}>{t('home.availabilityNone')}</p>
            ) : (
              periodes.map((periode) => (
                <div key={periode.id} className={styles.periode}>
                  <span>
                    {dates.format(new Date(periode.startDate))} –{' '}
                    {dates.format(new Date(periode.endDate))}
                  </span>

                  <button
                    type="button"
                    className={styles.boutonDanger}
                    onClick={() => retirerUnePeriode(periode.id)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              ))
            )}

            <div className={styles.lignes}>
              <label className={styles.champ}>
                <span className={styles.libelle}>
                  {t('availability.startDate')}
                </span>

                <input
                  type="date"
                  value={debut}
                  onChange={(evenement) => setDebut(evenement.target.value)}
                />
              </label>

              <label className={styles.champ}>
                <span className={styles.libelle}>
                  {t('availability.endDate')}
                </span>

                <input
                  type="date"
                  value={fin}
                  min={debut || undefined}
                  onChange={(evenement) => setFin(evenement.target.value)}
                />
              </label>
            </div>

            <button
              type="button"
              className={styles.boutonClair}
              disabled={!debut || !fin}
              onClick={ajouterUnePeriode}
            >
              {t('home.availabilityAdd')}
            </button>
          </section>

          <section className={styles.blocDanger}>
            <h2 className={styles.blocTitre}>
              {t('profile.settings.dangerZone')}
            </h2>

            {confirmeSuppression ? (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.boutonClair}
                  onClick={() => setConfirmeSuppression(false)}
                >
                  {t('common.cancel')}
                </button>

                <button
                  type="button"
                  className={styles.boutonDanger}
                  onClick={supprimer}
                >
                  {t('common.delete')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.boutonDanger}
                onClick={() => setConfirmeSuppression(true)}
              >
                {t('common.delete')}
              </button>
            )}
          </section>
        </>
      ) : null}
    </form>
  );
}
