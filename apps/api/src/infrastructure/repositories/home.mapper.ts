import { Prisma } from '@prisma/client';
import {
  HomeEntity,
  HomePhotoEntity,
} from 'src/domain/auth/entities/home.entity';

// Forme Prisma attendue par les mappers : tout repository qui veut produire un
// HomeEntity complet doit charger ces relations.
export const HOME_WITH_RELATIONS_INCLUDE = {
  photos: true,
  vehicle: true,
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      createdAt: true,
    },
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

  return {
    id: owner.id,
    firstName: owner.firstName,
    lastName: owner.lastName,
    avatarUrl: owner.avatarUrl,
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
    createdAt: home.createdAt,
    updatedAt: home.updatedAt,
    vehicle: mapVehicle(home.vehicle),
  };
}
