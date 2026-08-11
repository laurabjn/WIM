import { Injectable } from '@nestjs/common';
import { HomeSearchRepository } from 'src/domain/auth/repositories/home-search.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import {
    HomeSearchResult,
    SearchHomesFilters
} from 'src/domain/auth/entities/search-home.entity';

@Injectable()
export class HomeSearchPrismaRepository implements HomeSearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(filters: SearchHomesFilters): Promise<HomeSearchResult[]> {
    const { userId, city, country, capacity, homeType, startDate, endDate } =
      filters;

    const homes = await this.prisma.home.findMany({
      where: {
        ownerId: {
          not: userId,
          notIn: await this.hiddenOwnerIds(userId),
        },

        city: city
          ? {
              contains: city,
              mode: 'insensitive',
            }
          : undefined,

        country: country
          ? {
              contains: country,
              mode: 'insensitive',
            }
          : undefined,

        capacity: capacity
          ? {
              gte: capacity,
            }
          : undefined,

        homeType: homeType || undefined,

        ...(startDate && endDate
          ? {
              availabilities: {
                some: {
                  type: 'AVAILABLE',
                  startDate: {
                    lte: new Date(startDate),
                  },
                  endDate: {
                    gte: new Date(endDate),
                  },
                },
              },
            }
          : {}),
      },

      include: {
        photos: {
          orderBy: {
            position: 'asc',
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },

        favorites: {
          where: { userId },
          select: { id: true },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return homes.map((home) => ({
      id: home.id,
      title: home.title,
      description: home.description,
      city: home.city,
      country: home.country,
      capacity: home.capacity,
      homeType: home.homeType,
      latitude: home.latitude,
      longitude: home.longitude,
      coverPhotoUrl: home.photos[0]?.url ?? null,
      beds: home.beds,
      bedrooms: home.bedrooms,
      averageRating: home.averageRating,
      reviewsCount: home.reviewsCount,
      isFavorite: home.favorites.length > 0,
      photos: home.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        position: photo.position,
      })),
      owner: {
        id: home.owner.id,
        firstName: home.owner.firstName,
        lastName: home.owner.lastName,
        avatarUrl: home.owner.avatarUrl,
      },
    }));
  }

  private async hiddenOwnerIds(userId: string): Promise<string[]> {
    const relations = await this.prisma.blockedUser.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
      select: { blockerId: true, blockedId: true },
    });

    return relations.map((relation) =>
      relation.blockerId === userId ? relation.blockedId : relation.blockerId,
    );
  }
}