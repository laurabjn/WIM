import { Injectable } from '@nestjs/common';
import { RecommendationHome } from 'src/domain/auth/entities/recommendation.entity';
import { PrismaService } from '../database/prisma/prisma.service';
import { mapAmenities } from 'src/shared/utils/map-amenities';

@Injectable()
export class SwipeRecommendationPrismaRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findCandidates(
    userId: string,
    limit = 100,
  ): Promise<RecommendationHome[]> {
    const previousSwipes =
      await this.prisma.swipe.findMany({
        where: {
          swiperId: userId,
        },
        select: {
          homeId: true,
        },
      });

    const excludedHomeIds =
      previousSwipes.map(
        (swipe) => swipe.homeId,
      );

    const homes =
      await this.prisma.home.findMany({
        where: {
          ownerId: {
            not: userId,
          },

          id: {
            notIn: excludedHomeIds,
          },

          /*
           * Adapte avec les champs existants.
           */
          // status: 'PUBLISHED',

          photos: {
            some: {},
          },
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
        },

        take: limit,

        orderBy: {
          createdAt: 'desc',
        },
      });

    return homes.map((home) => ({
      id: home.id,
      ownerId: home.ownerId,
      title: home.title,
      description: home.description,
      city: home.city,
      country: home.country,
      latitude: home.latitude,
      longitude: home.longitude,
      capacity: home.capacity,
      homeType: home.homeType,
      amenities: mapAmenities(home.amenities),
      carExchangeAccepted:
      home.carExchangeAccepted,
      photos: home.photos.map(
        (photo) => ({
          id: photo.id,
          url: photo.url,
          position: photo.position,
        }),
      ),
      beds: home.beds,
      bedrooms: home.bedrooms,
      bathrooms: home.bathrooms,
      averageRating: home.averageRating,
      reviewsCount: home.reviewsCount,
      owner: home.owner,
    }));
  }
}