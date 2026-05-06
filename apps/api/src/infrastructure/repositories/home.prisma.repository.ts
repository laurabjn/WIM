import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HomePhotoEntity, HomeEntity } from 'src/domain/auth/entities/home.entity';
import {
  HomeRepository,
  CreateHomeRepositoryData,
  UpdateHomeRepositoryData
} from 'src/domain/auth/repositories/home.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

type PrismaHomeWithRelations  = Prisma.HomeGetPayload<{
  include: {
    photos: true;
    vehicle: true;
    owner: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        avatarUrl: true;
        createdAt: true;
      };
    };
  };
}>;

@Injectable()
export class HomeRepositoryPrisma implements HomeRepository {
  constructor(private readonly prisma: PrismaService) { }
  
  private mapVehicle(vehicle: PrismaHomeWithRelations['vehicle']) {
    if (!vehicle) return null;

    return {
      id: vehicle.id,
      homeId: vehicle.homeId,
      brand: vehicle.brand,
      model: vehicle.model,
      seats: vehicle.seats,
      type: vehicle.type,
      imageUrl: vehicle.imageUrl,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  private mapOwner(owner: PrismaHomeWithRelations['owner']) {
    if (!owner) return null;

    return {
      id: owner.id,
      firstName: owner.firstName,
      lastName: owner.lastName,
      avatarUrl: owner.avatarUrl,
      createdAt: owner.createdAt,
    };
  }

  private mapPhoto(photo: PrismaHomeWithRelations['photos'][number]): HomePhotoEntity {
    return {
      id: photo.id,
      homeId: photo.homeId,
      url: photo.url,
      position: photo.position,
      createdAt: photo.createdAt,
    };
  }

  private mapHome(home: PrismaHomeWithRelations): HomeEntity {
    return {
      id: home.id,
      ownerId: home.ownerId,
      owner: this.mapOwner(home.owner),
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
      amenities: Array.isArray(home.amenities) ? (home.amenities as string[]) : [],
      isAvailableForExchange: home.isAvailableForExchange ?? false,
      pricePerNight: home.pricePerNight ?? null,
      averageRating: home.averageRating ?? null,
      reviewCount: home.reviewCount ?? 0,
      carExchangeAccepted: home.carExchangeAccepted ?? false,
      photos: home.photos.map((photo) => this.mapPhoto(photo)),
      createdAt: home.createdAt,
      updatedAt: home.updatedAt,
      vehicle: this.mapVehicle(home.vehicle),
    };
  }

  async create(data: CreateHomeRepositoryData): Promise<HomeEntity> {
    const home = await this.prisma.home.create({
      data: {
        ownerId: data.ownerId,
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,

        capacity: data.capacity,
        beds: data.beds,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,

        homeType: data.homeType,
        amenities: data.amenities,
        isAvailableForExchange: data.isAvailableForExchange,
        pricePerNight: data.pricePerNight,
        averageRating: data.averageRating,
        reviewCount: data.reviewCount,
        carExchangeAccepted: data.carExchangeAccepted,

        vehicle:
          data.carExchangeAccepted && data.vehicle
            ? {
                create: {
                  brand: data.vehicle.brand,
                  model: data.vehicle.model,
                  seats: data.vehicle.seats,
                  type: data.vehicle.type,
                  imageUrl: data.vehicle.imageUrl,
                },
              }
            : undefined,
      },
      include: {
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
      },
    });

    return this.mapHome(home);
  }

  async findById(id: string): Promise<HomeEntity | null> {
    const home = await this.prisma.home.findUnique({
      where: { id },
      include: {
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
          },
        },
      },
    });

    if (!home) return null;
    return this.mapHome(home);
  }

  async findByOwnerId(ownerId: string): Promise<HomeEntity[]> {
    const homes = await this.prisma.home.findMany({
      where: { ownerId },
      include: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return homes.map((home) => this.mapHome(home));
  }

  async update(id: string, data: UpdateHomeRepositoryData): Promise<HomeEntity> {
    const { vehicle, ...homeData } = data;

    const home = await this.prisma.home.update({
      where: { id },
      data: {
        ...homeData,

        vehicle:
          vehicle !== undefined
            ? vehicle
              ? {
                  upsert: {
                    create: {
                      brand: vehicle.brand,
                      model: vehicle.model,
                      seats: vehicle.seats,
                      type: vehicle.type,
                      imageUrl: vehicle.imageUrl,
                    },
                    update: {
                      brand: vehicle.brand,
                      model: vehicle.model,
                      seats: vehicle.seats,
                      type: vehicle.type,
                      imageUrl: vehicle.imageUrl,
                    },
                  },
                }
              : {
                  delete: true,
                }
            : undefined,
      },
      include: {
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
          },
        },
      },
    });

    return this.mapHome(home);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.home.delete({
      where: { id },
    });
  }

  async addPhoto(homeId: string, url: string, position: number): Promise<HomePhotoEntity> {
    const photo = await this.prisma.homePhoto.create({
      data: {
        homeId,
        url,
        position,
      },
    });

    return {
      id: photo.id,
      homeId: photo.homeId,
      url: photo.url,
      position: photo.position,
      createdAt: photo.createdAt,
    };
  }

  async removePhoto(photoId: string): Promise<void> {
    await this.prisma.homePhoto.delete({
      where: { id: photoId },
    });
  }
}