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
    category: home.category ?? null,
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
