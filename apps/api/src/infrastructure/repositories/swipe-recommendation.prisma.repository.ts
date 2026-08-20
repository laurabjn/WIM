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

    // Les personnes avec qui la conversation est deja entamee sortent du paquet :
    // les redecouvrir par un swipe n'aurait aucun sens.
    const openChats = await this.prisma.chat.findMany({
      where: {
        participants: { some: { userId } },
        messages: { some: {} },
      },
      select: {
        participants: { select: { userId: true } },
      },
    });

    const alreadyTalkingTo = openChats
      .flatMap((chat) => chat.participants.map((p) => p.userId))
      .filter((id) => id !== userId);

    // Un blocage vaut dans les deux sens : ni celui qui a bloque ni celui qui
    // l'a ete ne doivent se retrouver dans les cartes de l'autre. Signaler
    // quelqu'un le bloque aussi, donc c'est ici que le signalement prend effet.
    const blocages = await this.prisma.blockedUser.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });

    const masques = blocages.map((relation) =>
      relation.blockerId === userId ? relation.blockedId : relation.blockerId,
    );

    const homes =
      await this.prisma.home.findMany({
        where: {
          // Un profil masque ne se decouvre pas au swipe : le reglage serait
          // sans effet s'il continuait d'apparaitre dans les cartes.
          owner: { profileVisible: true },
          ownerId: {
            not: userId,
            notIn: [...alreadyTalkingTo, ...masques],
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