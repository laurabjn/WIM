import { Injectable } from '@nestjs/common';
import {
  RecommendationHome,
  RecommendationScoreDetails,
  ScoredHome,
  UserRecommendationProfile,
  WeightedPreference,
} from '../../../domain/auth/entities/recommendation.entity';
import { normalizeValue } from './preference-calculator';

@Injectable()
export class HomeRecommendationScorer {
  score(
    home: RecommendationHome,
    profile: UserRecommendationProfile,
  ): ScoredHome {
    const searchScore =
      this.calculateSearchScore(
        home,
        profile,
      );

    const favoriteScore =
      this.calculatePositivePreferenceScore(
        home,
        profile,
      );

    const likeScore =
      this.calculateCapacityScore(
        home,
        profile,
      );

    const dislikePenalty =
      this.calculateDislikePenalty(
        home,
        profile,
      );

    const profileScore =
      this.calculateProfileScore(
        home,
        profile,
      );

    const qualityScore =
      this.calculateQualityScore(home);

    const discoveryScore =
      this.calculateDiscoveryScore(
        home,
        profile,
      );

    const rawTotal =
      searchScore +
      favoriteScore +
      likeScore +
      profileScore +
      qualityScore +
      discoveryScore -
      dislikePenalty;

    const totalScore = Math.max(
      0,
      Math.min(100, rawTotal),
    );

    const details: RecommendationScoreDetails = {
      searchScore,
      favoriteScore,
      likeScore,
      dislikePenalty,
      profileScore,
      qualityScore,
      discoveryScore,
      totalScore,
    };

    return {
      home,
      score: totalScore,
      details,
    };
  }

  private calculateSearchScore(
    home: RecommendationHome,
    profile: UserRecommendationProfile,
  ): number {
    let score = 0;

    const cityWeight = this.findWeight(
      profile.preferredCities,
      home.city,
    );

    const countryWeight = this.findWeight(
      profile.preferredCountries,
      home.country,
    );

    score += cityWeight * 15;
    score += countryWeight * 5;

    if (
      profile.lastSearchLatitude !== null &&
      profile.lastSearchLongitude !== null &&
      home.latitude !== null &&
      home.longitude !== null
    ) {
      const distance = this.getDistanceInKm(
        profile.lastSearchLatitude,
        profile.lastSearchLongitude,
        home.latitude,
        home.longitude,
      );

      if (distance <= 10) {
        score += 10;
      } else if (distance <= 50) {
        score += 7;
      } else if (distance <= 150) {
        score += 3;
      }
    }

    return Math.min(25, score);
  }

  private calculatePositivePreferenceScore(
    home: RecommendationHome,
    profile: UserRecommendationProfile,
  ): number {
    let score = 0;

    const typeWeight = this.findWeight(
      profile.preferredHomeTypes,
      home.homeType,
    );

    score += typeWeight * 15;

    const matchedAmenities =
      home.amenities.reduce(
        (total, amenity) => {
          return (
            total +
            this.findWeight(
              profile.preferredAmenities,
              amenity,
            )
          );
        },
        0,
      );

    score += Math.min(
      15,
      matchedAmenities * 5,
    );

    return Math.min(30, score);
  }

  private calculateCapacityScore(
    home: RecommendationHome,
    profile: UserRecommendationProfile,
  ): number {
    if (profile.averageCapacity === null) {
      return 0;
    }

    const difference = Math.abs(
      home.capacity -
        profile.averageCapacity,
    );

    if (difference === 0) {
      return 15;
    }

    if (difference <= 1) {
      return 12;
    }

    if (difference <= 2) {
      return 8;
    }

    if (difference <= 4) {
      return 3;
    }

    return 0;
  }

  private calculateDislikePenalty(
    home: RecommendationHome,
    profile: UserRecommendationProfile,
  ): number {
    let penalty = 0;

    const cityWeight = this.findWeight(
      profile.dislikedCities,
      home.city,
    );

    const typeWeight = this.findWeight(
      profile.dislikedHomeTypes,
      home.homeType,
    );

    penalty += cityWeight * 10;
    penalty += typeWeight * 20;

    const dislikedAmenityWeight =
      home.amenities.reduce(
        (total, amenity) => {
          return (
            total +
            this.findWeight(
              profile.dislikedAmenities,
              amenity,
            )
          );
        },
        0,
      );

    penalty += Math.min(
      10,
      dislikedAmenityWeight * 3,
    );

    return Math.min(40, penalty);
  }

  // Ce que l'utilisateur a declare dans ses preferences de voyage. Une
  // demande explicite compte davantage qu'un gout devine par les swipes.
  private calculateProfileScore(
    home: RecommendationHome,
    profile: UserRecommendationProfile,
  ): number {
    let score = 0;

    if (profile.requiredAmenities.length > 0) {
      const presents = profile.requiredAmenities.filter((amenity) =>
        home.amenities.some(
          (value) => normalizeValue(value) === amenity,
        ),
      ).length;

      score +=
        (presents / profile.requiredAmenities.length) * 8;
    }

    if (profile.wantsCarExchange === true && home.carExchangeAccepted) {
      score += 4;
    }

    if (profile.desiredCapacity !== null) {
      // Un logement trop petit pour le groupe annonce ne convient pas ;
      // legerement plus grand ne derange personne.
      if (home.capacity >= profile.desiredCapacity) {
        score += 3;
      } else {
        score -= 4;
      }
    }

    if (home.photos.length >= 4) {
      score += 1;
    }

    return Math.max(-4, Math.min(15, score));
  }

  private calculateQualityScore(
    home: RecommendationHome,
  ): number {
    let score = 0;

    if (home.title.trim().length >= 10) {
      score += 2;
    }

    if (
      home.description.trim().length >= 100
    ) {
      score += 3;
    }

    if (home.photos.length >= 3) {
      score += 3;
    }

    if (home.amenities.length >= 5) {
      score += 2;
    }

    return Math.min(10, score);
  }

  private calculateDiscoveryScore(
    home: RecommendationHome,
    profile: UserRecommendationProfile,
  ): number {
    const cityAlreadyPreferred =
      this.findWeight(
        profile.preferredCities,
        home.city,
      ) > 0;

    const typeAlreadyPreferred =
      this.findWeight(
        profile.preferredHomeTypes,
        home.homeType,
      ) > 0;

    /*
     * Bonus d’exploration :
     * un logement légèrement différent peut être testé.
     */
    if (
      !cityAlreadyPreferred &&
      typeAlreadyPreferred
    ) {
      return 5;
    }

    if (
      cityAlreadyPreferred &&
      !typeAlreadyPreferred
    ) {
      return 3;
    }

    return 0;
  }

  private findWeight(
    preferences: WeightedPreference[],
    value?: string | null,
  ): number {
    const normalized = normalizeValue(value);

    return (
      preferences.find(
        (preference) =>
          preference.value === normalized,
      )?.weight ?? 0
    );
  }

  private getDistanceInKm(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ): number {
    const earthRadius = 6371;

    const latitudeDifference =
      this.toRadians(
        latitude2 - latitude1,
      );

    const longitudeDifference =
      this.toRadians(
        longitude2 - longitude1,
      );

    const a =
      Math.sin(
        latitudeDifference / 2,
      ) ** 2 +
      Math.cos(
        this.toRadians(latitude1),
      ) *
        Math.cos(
          this.toRadians(latitude2),
        ) *
        Math.sin(
          longitudeDifference / 2,
        ) ** 2;

    return (
      2 *
      earthRadius *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a),
      )
    );
  }

  private toRadians(
    value: number,
  ): number {
    return (value * Math.PI) / 180;
  }
}