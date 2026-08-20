import { Injectable } from '@nestjs/common';
import type { MyRequestListItem } from '@wim/shared';
import { HomeRecommendationScorer } from 'src/application/swipe/services/home-recommendation-scorer';
import { UserRecommendationProfileBuilder } from 'src/application/swipe/services/user-recommendation-profile.builder';
import { RecommendationHome } from 'src/domain/auth/entities/recommendation.entity';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { GetMyChatsUseCase } from './get-my-chat.usecase';

@Injectable()
export class GetMyRequestsUseCase {
  constructor(
    private readonly getMyChats: GetMyChatsUseCase,
    private readonly profileBuilder: UserRecommendationProfileBuilder,
    private readonly scorer: HomeRecommendationScorer,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string): Promise<MyRequestListItem[]> {
    const chats = await this.getMyChats.execute(userId);

    const requests = chats.filter((chat) => chat.isRequest);

    if (requests.length === 0) return [];

    const senderIds = requests
      .map((request) => request.participant.id)
      .filter((id) => id.length > 0);

    const [profile, homes] = await Promise.all([
      this.profileBuilder.build(userId),

      this.prisma.home.findMany({
        where: {
          ownerId: { in: senderIds },
          isAvailableForExchange: true,
        },
        include: {
          photos: { orderBy: { position: 'asc' } },
        },
      }),
    ]);

    const bestScoreBySender = new Map<string, number>();

    for (const home of homes) {
      const { score } = this.scorer.score(
        this.toRecommendationHome(home),
        profile,
      );

      if (score > (bestScoreBySender.get(home.ownerId) ?? 0)) {
        bestScoreBySender.set(home.ownerId, score);
      }
    }

    return requests
      .map((request) => ({
        ...request,
        relevanceScore: Math.round(
          bestScoreBySender.get(request.participant.id) ?? 0,
        ),
      }))
      .sort(
        (a, b) =>
          b.relevanceScore - a.relevanceScore ||
          Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      );
  }

  private toRecommendationHome(home: {
    id: string;
    ownerId: string;
    title: string;
    description: string | null;
    city: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    capacity: number;
    homeType: string;
    amenities: unknown;
    carExchangeAccepted: boolean;
    photos: Array<{ id: string; url: string; position: number }>;
  }): RecommendationHome {
    return {
      id: home.id,
      ownerId: home.ownerId,
      title: home.title,
      description: home.description ?? '',
      city: home.city,
      country: home.country,
      latitude: home.latitude,
      longitude: home.longitude,
      capacity: home.capacity,
      homeType: home.homeType,
      amenities: Array.isArray(home.amenities)
        ? home.amenities.filter(
            (amenity): amenity is string => typeof amenity === 'string',
          )
        : [],
      carExchangeAccepted: home.carExchangeAccepted,
      photos: home.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        position: photo.position,
      })),
    };
  }
}
