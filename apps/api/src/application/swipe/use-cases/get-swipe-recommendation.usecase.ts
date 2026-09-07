import { Injectable } from '@nestjs/common';
import { UserRecommendationProfileBuilder } from '../services/user-recommendation-profile.builder';
import { HomeRecommendationScorer } from '../services/home-recommendation-scorer';
import { SwipeRecommendationPrismaRepository } from 'src/infrastructure/repositories/swipe-recommendation.prisma.repository';
import { ScoredHome } from 'src/domain/auth/entities/recommendation.entity';
import { RecommendationWeightsService } from '../services/recommendation-weights.service';

export type GetSwipeRecommendationsInput = {
  userId: string;
  limit?: number;
};

@Injectable()
export class GetSwipeRecommendationsUseCase {
  constructor(
    private readonly repository: SwipeRecommendationPrismaRepository,

    private readonly profileBuilder: UserRecommendationProfileBuilder,

    private readonly scorer: HomeRecommendationScorer,

    private readonly weights: RecommendationWeightsService,
  ) {}

  async execute({
    userId,
    limit = 20,
  }: GetSwipeRecommendationsInput) {
    const [profile, candidates, poids] =
      await Promise.all([
        this.profileBuilder.build(userId),

        this.repository.findCandidates(
          userId,
          150,
        ),

        this.weights.valeurs(),
      ]);

    const scoredHomes = candidates
      .map((home) =>
        this.scorer.score(
          home,
          profile,
          poids,
        ),
      )
      .sort(
        (first, second) =>
          second.score - first.score,
      );

    const diversified =
      this.diversifyResults(
        scoredHomes,
        limit,
      );

    return {
      profile,
      results: diversified.map(
        ({ home, score, details }) => ({
          ...home,

          /*
           * À garder pendant le développement.
           * Tu pourras le retirer en production.
           */
          recommendationScore: score,
          recommendationDetails: details,
        }),
      ),
    };
  }

  private diversifyResults(
    homes: ScoredHome[],
    limit: number,
  ): ScoredHome[] {
    if (homes.length <= limit) {
      return homes;
    }
    const recommendedCount = Math.ceil(
      limit * 0.8,
    );

    const discoveryCount =
      limit - recommendedCount;

    const bestHomes = homes.slice(
      0,
      recommendedCount,
    );

    const remainingHomes = homes.slice(
      recommendedCount,
    );

    const discoveryHomes =
      this.pickRandomDistinct(
        remainingHomes,
        discoveryCount,
      );

    return this.interleave(
      bestHomes,
      discoveryHomes,
    ).slice(0, limit);
  }

  private pickRandomDistinct<T>(
    values: T[],
    count: number,
  ): T[] {
    return [...values]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  private interleave<T>(
    recommended: T[],
    discovery: T[],
  ): T[] {
    const result: T[] = [];
    let discoveryIndex = 0;

    recommended.forEach(
      (item, index) => {
        result.push(item);
        if (
          (index + 1) % 4 === 0 &&
          discovery[
            discoveryIndex
          ]
        ) {
          result.push(
            discovery[discoveryIndex],
          );

          discoveryIndex += 1;
        }
      },
    );

    return [
      ...result,
      ...discovery.slice(
        discoveryIndex,
      ),
    ];
  }
}