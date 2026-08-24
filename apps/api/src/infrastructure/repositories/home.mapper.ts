import { Prisma } from '@prisma/client';
import {
  HomeEntity,
  HomePhotoEntity,
  ReviewEntity,
} from 'src/domain/auth/entities/home.entity';

export const HOME_WITH_RELATIONS_INCLUDE = {
  photos: {
    orderBy: { position: 'asc' },
  },
  vehicle: true,
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      showPreciseLocation: true,
      createdAt: true,
      homes: {
        select: {
          reviews: { select: { score: true } },
        },
      },
    },
  },
  reviews: {
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
  },
  availabilities: {
    orderBy: { startDate: 'asc' },
  },
  // Un sejour en cours occupe le logement : sa disponibilite affichee doit le
  // refleter, quel que soit le reglage du proprietaire.
  // Un echange occupe le logement de l'hote et celui de l'invite, tous deux
  // nommes. Interroger les deux cotes evite de condamner les autres logements
  // du meme proprietaire.
  exchanges: {
    where: { status: 'CURRENT' },
    select: { id: true },
  },
  guestExchanges: {
    where: { status: 'CURRENT' },
    select: { id: true },
  },
} satisfies Prisma.HomeInclude;

export type PrismaHomeWithRelations = Prisma.HomeGetPayload<{
  include: typeof HOME_WITH_RELATIONS_INCLUDE;
}>;

const PRECISION_APPROCHEE = 100;

function arrondirSiDemande(
  valeur: unknown,
  precise: boolean | undefined,
): number | null {
  if (valeur === null || valeur === undefined) return null;

  const nombre = Number(valeur);

  if (Number.isNaN(nombre)) return null;

  if (precise === false) {
    return Math.round(nombre * PRECISION_APPROCHEE) / PRECISION_APPROCHEE;
  }

  return nombre;
}

export function mapVehicle(vehicle: PrismaHomeWithRelations['vehicle']) {
  if (!vehicle) return null;

  return {
    id: vehicle.id,
    homeId: vehicle.homeId,
    brand: vehicle.brand,
    model: vehicle.model,
    seats: vehicle.seats,
    type: vehicle.type,
    fuelType: vehicle.fuelType,
    imageUrl: vehicle.imageUrl,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
  };
}

export function mapOwner(owner: PrismaHomeWithRelations['owner']) {
  if (!owner) return null;

  const scores = owner.homes.flatMap((home) =>
    home.reviews.map((review) => review.score),
  );

  return {
    id: owner.id,
    firstName: owner.firstName,
    lastName: owner.lastName,
    avatarUrl: owner.avatarUrl,
    rating:
      scores.length > 0
        ? Math.round(
            (scores.reduce((sum, score) => sum + score, 0) / scores.length) *
              10,
          ) / 10
        : null,
    createdAt: owner.createdAt,
  };
}

export function mapPhoto(
  photo: PrismaHomeWithRelations['photos'][number],
): HomePhotoEntity {
  return {
    id: photo.id,
    homeId: photo.homeId,
    url: photo.url,
    position: photo.position,
    createdAt: photo.createdAt,
  };
}

export function mapReview(
  review: PrismaHomeWithRelations['reviews'][number],
): ReviewEntity {
  return {
    id: review.id,
    score: review.score,
    comment: review.comment,
    reply: review.reply,
    replyAt: review.replyAt,
    createdAt: review.createdAt,
    author: {
      id: review.author.id,
      firstName: review.author.firstName,
      avatarUrl: review.author.avatarUrl,
      createdAt: review.author.createdAt,
    },
  };
}

export function mapHome(home: PrismaHomeWithRelations): HomeEntity {
  return {
    id: home.id,
    ownerId: home.ownerId,
    owner: mapOwner(home.owner),
    title: home.title,
    description: home.description,
    address: home.address,
    city: home.city,
    country: home.country,
    latitude: arrondirSiDemande(home.latitude, home.owner?.showPreciseLocation),
    longitude: arrondirSiDemande(
      home.longitude,
      home.owner?.showPreciseLocation,
    ),
    capacity: home.capacity,
    beds: home.beds,
    bedrooms: home.bedrooms ?? 0,
    bathrooms: home.bathrooms ?? 0,
    homeType: home.homeType,
    category: home.category ?? null,
    amenities: Array.isArray(home.amenities) ? (home.amenities as string[]) : [],
    // Le reglage du proprietaire reste intact : l'ecran d'edition le relit, et
    // le confondre avec l'occupation le ferait reenregistrer a faux.
    isAvailableForExchange: home.isAvailableForExchange ?? false,
    occupiedByExchange:
      home.exchanges.length > 0 || home.guestExchanges.length > 0,
    pricePerNight: home.pricePerNight ?? null,
    averageRating: home.averageRating ?? null,
    reviewsCount: home.reviewsCount ?? 0,
    carExchangeAccepted: home.carExchangeAccepted ?? false,
    photos: home.photos.map(mapPhoto),
    reviews: home.reviews.map(mapReview),
    availabilities: home.availabilities.map((availability) => ({
      id: availability.id,
      homeId: availability.homeId,
      startDate: availability.startDate,
      endDate: availability.endDate,
      type: availability.type,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    })),
    createdAt: home.createdAt,
    updatedAt: home.updatedAt,
    vehicle: mapVehicle(home.vehicle),
  };
}
