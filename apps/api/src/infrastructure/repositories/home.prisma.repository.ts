import { Injectable } from '@nestjs/common';
import { HomePhotoEntity, HomeEntity } from 'src/domain/auth/entities/home.entity';
import {
  HomeRepository,
  CreateHomeRepositoryData,
  UpdateHomeRepositoryData
} from 'src/domain/auth/repositories/home.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import {
  HOME_WITH_RELATIONS_INCLUDE,
  PrismaHomeWithRelations,
  mapHome,
  mapPhoto,
} from './home.mapper';

@Injectable()
export class HomeRepositoryPrisma implements HomeRepository {
  constructor(private readonly prisma: PrismaService) { }

  private mapPhoto(photo: PrismaHomeWithRelations['photos'][number]): HomePhotoEntity {
    return mapPhoto(photo);
  }

  private mapHome(home: PrismaHomeWithRelations): HomeEntity {
    return mapHome(home);
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
        category: data.category ?? null,
        amenities: data.amenities,
        isAvailableForExchange: data.isAvailableForExchange,
        pricePerNight: data.pricePerNight,
        averageRating: data.averageRating,
        reviewsCount: data.reviewCount,
        carExchangeAccepted: data.carExchangeAccepted,

        vehicle:
          data.carExchangeAccepted && data.vehicle
            ? {
                create: {
                  brand: data.vehicle.brand,
                  model: data.vehicle.model,
                  seats: data.vehicle.seats,
                  type: data.vehicle.type,
                  fuelType: data.vehicle.fuelType,
                  imageUrl: data.vehicle.imageUrl,
                },
              }
            : undefined,
      },
      include: HOME_WITH_RELATIONS_INCLUDE,
    });

    return this.mapHome(home);
  }

  async findAll(): Promise<HomeEntity[]> {
    const homes = await this.prisma.home.findMany({
      include: HOME_WITH_RELATIONS_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return homes.map((home) => this.mapHome(home));
  }

  async findById(id: string): Promise<HomeEntity | null> {
    const home = await this.prisma.home.findUnique({
      where: { id },
      include: HOME_WITH_RELATIONS_INCLUDE,
    });

    if (!home) return null;
    return this.mapHome(home);
  }

  async findByOwnerId(ownerId: string): Promise<HomeEntity[]> {
    const homes = await this.prisma.home.findMany({
      where: { ownerId },
      include: HOME_WITH_RELATIONS_INCLUDE,
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
      include: HOME_WITH_RELATIONS_INCLUDE,
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