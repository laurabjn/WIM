import { Prisma } from '@prisma/client';
import {
  HomeEntity,
  HomePhotoEntity,
  ReviewEntity,
} from 'src/domain/auth/entities/home.entity';

// Forme Prisma attendue par les mappers : tout repository qui veut produire un
// HomeEntity complet doit charger ces relations.
export const HOME_WITH_RELATIONS_INCLUDE = {
  // Triées : la première photo sert de visuel de couverture.
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
      createdAt: true,
      // Les notes de tous les avis reçus par cet hôte, sur l'ensemble de ses
      // logements. La colonne `rating` de l'utilisateur existe toujours mais
      // n'est plus lue : c'était une valeur figée, qu'aucun avis ne mettait à
      // jour, d'où un hôte à 5 étoiles dont les logements affichaient 4,3.
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
          firstName: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
  },
  // Le bandeau du détail lit home.availabilities : sans cet include, il
  // affichait « Aucune disponibilité » même pour un logement qui en a.
  availabilities: {
    orderBy: { startDate: 'asc' },
  },
} satisfies Prisma.HomeInclude;

export type PrismaHomeWithRelations = Prisma.HomeGetPayload<{
  include: typeof HOME_WITH_RELATIONS_INCLUDE;
}>;

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
    // Moyenne des avis reçus, arrondie au dixième comme l'affichage.
    // `null` tant qu'aucun avis n'existe : l'application montre alors « N/A »
    // plutôt qu'un 0 qui se lirait comme une mauvaise note.
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
    createdAt: review.createdAt,
    author: {
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
    latitude: home.latitude ? Number(home.latitude) : null,
    longitude: home.longitude ? Number(home.longitude) : null,
    capacity: home.capacity,
    beds: home.beds,
    bedrooms: home.bedrooms ?? 0,
    bathrooms: home.bathrooms ?? 0,
    homeType: home.homeType,
    // `amenities` est une colonne Json : Prisma la type en JsonValue, il faut
    // donc vérifier que c'est bien un tableau avant de la présenter en string[].
    amenities: Array.isArray(home.amenities) ? (home.amenities as string[]) : [],
    isAvailableForExchange: home.isAvailableForExchange ?? false,
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
