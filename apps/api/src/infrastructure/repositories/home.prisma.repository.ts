import { PrismaClient } from '@prisma/client';

export class HomeRepositoryPrisma {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    ownerId: string;
    title: string;
    description?: string;
    address?: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    capacity: number;
    homeType: string;
  }) {
    return this.prisma.home.create({
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
        homeType: data.homeType,
      },
    });
  }
}
