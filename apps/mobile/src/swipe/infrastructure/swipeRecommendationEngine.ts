import {
    RecommendationDetails,
    RecommendationProfile,
    RecommendationUserMock,
    RecommendedSwipeHome,
    SwipeHomeMock,
    WeightedPreference
} from "@wim/shared/swipe/swipeRecommendation.types";
import { SwipeMockProfileBuilder } from "./swipeProfileBuilder";
import { normalizePreference } from "./swipePreferenceCalculator";

export class SwipeMockRecommendationEngine {
  private readonly profileBuilder =
    new SwipeMockProfileBuilder();

  recommend(
    user: RecommendationUserMock,
    allHomes: SwipeHomeMock[],
    options?: {
      excludeAlreadySwiped?: boolean;
      limit?: number;
      includeDiscovery?: boolean;
    },
  ): RecommendedSwipeHome[] {
    const profile =
      this.profileBuilder.build(
        user,
        allHomes,
      );

    const excludeAlreadySwiped =
      options?.excludeAlreadySwiped ?? true;

    const limit =
      options?.limit ?? 20;

    const alreadySwipedIds = new Set([
      ...user.likedHomeIds,
      ...user.dislikedHomeIds,
    ]);

    const candidates =
      excludeAlreadySwiped
        ? allHomes.filter(
            (home) =>
              !alreadySwipedIds.has(home.id),
          )
        : allHomes;

    const scoredHomes = candidates
      .map((home) =>
        this.scoreHome(
          home,
          profile,
          user,
        ),
      )
      .sort(
        (first, second) =>
          second.recommendationScore -
          first.recommendationScore,
      );

    if (
      options?.includeDiscovery === false
    ) {
      return scoredHomes.slice(0, limit);
    }

    return this.diversify(
      scoredHomes,
      limit,
    );
  }

  buildProfile(
    user: RecommendationUserMock,
    homes: SwipeHomeMock[],
  ): RecommendationProfile {
    return this.profileBuilder.build(
      user,
      homes,
    );
  }

  private scoreHome(
    home: SwipeHomeMock,
    profile: RecommendationProfile,
    user: RecommendationUserMock,
  ): RecommendedSwipeHome {
    const cityScore =
      this.findWeight(
        profile.preferredCities,
        home.city,
      ) * 22;

    const countryScore =
      this.findWeight(
        profile.preferredCountries,
        home.country,
      ) * 7;

    const homeTypeScore =
      this.findWeight(
        profile.preferredHomeTypes,
        home.homeType,
      ) * 18;

    const amenitiesScore =
      this.calculateAmenitiesScore(
        home,
        profile,
      );

    const capacityScore =
      this.calculateCapacityScore(
        home,
        profile,
      );

    const priceScore =
      this.calculatePriceScore(
        home,
        profile,
      );

    const qualityScore =
      this.calculateQualityScore(home);

    const searchScore =
      this.calculateLatestSearchScore(
        home,
        user,
      );

    const dislikePenalty =
      this.calculateDislikePenalty(
        home,
        profile,
      );

    const discoveryScore =
      this.calculateDiscoveryScore(
        home,
        profile,
      );

    const rawTotal =
      cityScore +
      countryScore +
      homeTypeScore +
      amenitiesScore +
      capacityScore +
      priceScore +
      qualityScore +
      searchScore +
      discoveryScore -
      dislikePenalty;

    const totalScore = Number(
      Math.max(
        0,
        Math.min(100, rawTotal),
      ).toFixed(2),
    );

    const recommendationDetails:
      RecommendationDetails = {
      cityScore:
        Number(cityScore.toFixed(2)),

      countryScore:
        Number(countryScore.toFixed(2)),

      homeTypeScore:
        Number(homeTypeScore.toFixed(2)),

      amenitiesScore:
        Number(amenitiesScore.toFixed(2)),

      capacityScore:
        Number(capacityScore.toFixed(2)),

      priceScore:
        Number(priceScore.toFixed(2)),

      qualityScore:
        Number(qualityScore.toFixed(2)),

      searchScore:
        Number(searchScore.toFixed(2)),

      dislikePenalty:
        Number(dislikePenalty.toFixed(2)),

      discoveryScore:
        Number(discoveryScore.toFixed(2)),

      totalScore,
    };

    return {
      ...home,
      recommendationScore: totalScore,
      recommendationDetails,
    };
  }

  private calculateAmenitiesScore(
    home: SwipeHomeMock,
    profile: RecommendationProfile,
  ): number {
    const totalWeight =
      home.amenities.reduce(
        (sum, amenity) =>
          sum +
          this.findWeight(
            profile.preferredAmenities,
            amenity,
          ),
        0,
      );

    return Math.min(
      20,
      totalWeight * 12,
    );
  }

  private calculateCapacityScore(
    home: SwipeHomeMock,
    profile: RecommendationProfile,
  ): number {
    if (profile.averageBeds === null) {
      return 0;
    }

    const difference = Math.abs(
      home.beds - profile.averageBeds,
    );

    if (difference <= 0.5) {
      return 10;
    }

    if (difference <= 1) {
      return 8;
    }

    if (difference <= 2) {
      return 5;
    }

    if (difference <= 3) {
      return 2;
    }

    return 0;
  }

  private calculatePriceScore(
    home: SwipeHomeMock,
    profile: RecommendationProfile,
  ): number {
    if (profile.averagePrice === null) {
      return 0;
    }

    const priceDifferenceRatio =
      Math.abs(
        home.pricePerNight -
        profile.averagePrice,
      ) / profile.averagePrice;

    if (priceDifferenceRatio <= 0.1) {
      return 6;
    }

    if (priceDifferenceRatio <= 0.25) {
      return 4;
    }

    if (priceDifferenceRatio <= 0.4) {
      return 2;
    }

    return 0;
  }

  private calculateQualityScore(
    home: SwipeHomeMock,
  ): number {
    const ratingScore =
      Math.max(
        0,
        home.averageRating - 3,
      ) * 2;

    const reviewsScore =
      Math.min(
        2,
        home.reviewsCount / 50,
      );

    const photosScore =
      Math.min(
        2,
        home.photos.length * 0.5,
      );

    return Math.min(
      8,
      ratingScore +
      reviewsScore +
      photosScore,
    );
  }

  private calculateLatestSearchScore(
    home: SwipeHomeMock,
    user: RecommendationUserMock,
  ): number {
    const latestSearch =
      user.searchHistory[0];

    if (!latestSearch) {
      return 0;
    }

    let score = 0;

    if (
      latestSearch.city &&
      normalizePreference(
        home.city,
      ) ===
        normalizePreference(
          latestSearch.city,
        )
    ) {
      score += 8;
    }

    if (
      latestSearch.country &&
      normalizePreference(
        home.country,
      ) ===
        normalizePreference(
          latestSearch.country,
        )
    ) {
      score += 2;
    }

    if (
      latestSearch.homeType &&
      home.homeType ===
        latestSearch.homeType
    ) {
      score += 4;
    }

    if (
      typeof latestSearch.beds ===
      'number'
    ) {
      const difference = Math.abs(
        home.beds -
        latestSearch.beds,
      );

      if (difference === 0) {
        score += 4;
      } else if (difference === 1) {
        score += 2;
      }
    }

    return Math.min(15, score);
  }

  private calculateDislikePenalty(
    home: SwipeHomeMock,
    profile: RecommendationProfile,
  ): number {
    const cityPenalty =
      this.findWeight(
        profile.dislikedCities,
        home.city,
      ) * 12;

    const homeTypePenalty =
      this.findWeight(
        profile.dislikedHomeTypes,
        home.homeType,
      ) * 20;

    const amenitiesPenalty =
      home.amenities.reduce(
        (sum, amenity) =>
          sum +
          this.findWeight(
            profile.dislikedAmenities,
            amenity,
          ) *
            2,
        0,
      );

    return Math.min(
      35,
      cityPenalty +
      homeTypePenalty +
      amenitiesPenalty,
    );
  }

  private calculateDiscoveryScore(
    home: SwipeHomeMock,
    profile: RecommendationProfile,
  ): number {
    const knownCity =
      this.findWeight(
        profile.preferredCities,
        home.city,
      ) > 0;

    const knownType =
      this.findWeight(
        profile.preferredHomeTypes,
        home.homeType,
      ) > 0;

    /*
     * Logement différent mais conservant
     * au moins un élément apprécié.
     */
    if (!knownCity && knownType) {
      return 3;
    }

    if (knownCity && !knownType) {
      return 2;
    }

    return 0;
  }

  private findWeight(
    preferences: WeightedPreference[],
    value?: string | null,
  ): number {
    const normalizedValue =
      normalizePreference(value);

    return (
      preferences.find(
        (preference) =>
          preference.value ===
          normalizedValue,
      )?.weight ?? 0
    );
  }

  private diversify(
    homes: RecommendedSwipeHome[],
    limit: number,
  ): RecommendedSwipeHome[] {
    if (homes.length <= limit) {
      return homes;
    }

    const mainCount =
      Math.ceil(limit * 0.8);

    const discoveryCount =
      limit - mainCount;

    const mainHomes =
      homes.slice(0, mainCount);

    const discoveryPool =
      homes.slice(mainCount);

    /*
     * Déterministe pour les mocks :
     * on prend des logements espacés
     * dans le classement.
     */
    const discoveryHomes =
      discoveryPool
        .filter(
          (_, index) =>
            index % 3 === 0,
        )
        .slice(0, discoveryCount);

    const result:
      RecommendedSwipeHome[] = [];

    let discoveryIndex = 0;

    for (
      let index = 0;
      index < mainHomes.length;
      index += 1
    ) {
      result.push(mainHomes[index]);

      if (
        (index + 1) % 4 === 0 &&
        discoveryHomes[
          discoveryIndex
        ]
      ) {
        result.push(
          discoveryHomes[
            discoveryIndex
          ],
        );

        discoveryIndex += 1;
      }
    }

    return result.slice(0, limit);
  }
}