import { Injectable } from '@nestjs/common';
import {
  calculateAverage,
  calculateWeightedPreferences,
  flattenAmenities,
} from './preference-calculator';
import { UserRecommendationProfile } from 'src/domain/auth/entities/recommendation.entity';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class UserRecommendationProfileBuilder {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async build(
    userId: string,
  ): Promise<UserRecommendationProfile> {
    const [
      favoriteHomes,
      likedSwipes,
      dislikedSwipes,
      recentSearches,
      user,
    ] = await Promise.all([
      this.getFavoriteHomes(userId),
      this.getSwipedHomes(userId, 'LIKE'),
      this.getSwipedHomes(userId, 'DISLIKE'),
      this.getRecentSearches(userId),
      this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          travelPreferences: true,
        },
      }),
    ]);

    const likedHomes = likedSwipes.map(
      (swipe) => swipe.home,
    );

    const dislikedHomes = dislikedSwipes.map(
      (swipe) => swipe.home,
    );

    const positiveHomes = [
      ...likedHomes,
      ...favoriteHomes,
      ...favoriteHomes,
    ];

    const preferences = (user?.travelPreferences ?? {}) as {
      preferredCountries?: string[];
      preferredCities?: string[];
      preferredHomeTypes?: string[];
      essentialAmenities?: string[];
      minCapacity?: number | null;
      maxCapacity?: number | null;
      travelersCount?: number | null;
      carExchangeAccepted?: boolean | null;
    };

    const asList = (values?: string[]) =>
      Array.isArray(values) ? values.filter(Boolean) : [];

    const DECLARED_WEIGHT = 3;

    const declared = (values?: string[]) =>
      asList(values).flatMap((value) =>
        Array.from({ length: DECLARED_WEIGHT }, () => value),
      );

    const preferredCities =
      calculateWeightedPreferences([
        ...declared(preferences.preferredCities),
        ...positiveHomes.map((home) => home.city),
        ...recentSearches.map(
          (search) => search.city,
        ),
        ...recentSearches.map(
          (search) => search.city,
        ),
      ]);

    const preferredCountries =
      calculateWeightedPreferences([
        ...declared(preferences.preferredCountries),
        ...positiveHomes.map(
          (home) => home.country,
        ),
        ...recentSearches.map(
          (search) => search.country,
        ),
      ]);

    const preferredHomeTypes =
      calculateWeightedPreferences([
        ...declared(preferences.preferredHomeTypes),
        ...positiveHomes.map((home) => home.homeType),
      ]);

    const preferredAmenities =
      calculateWeightedPreferences([
        ...declared(preferences.essentialAmenities),
        ...flattenAmenities(positiveHomes),
      ]);

    const capacities = [
      ...positiveHomes.map(
        (home) => home.capacity,
      ),
      ...recentSearches
        .map((search) => search.capacity)
        .filter(
          (capacity): capacity is number =>
            typeof capacity === 'number',
        ),
    ];

    const lastSearch = recentSearches[0];

    return {
      preferredCities,
      preferredCountries,
      preferredHomeTypes,
      preferredAmenities,

      averageCapacity:
        calculateAverage(capacities),

      dislikedCities:
        calculateWeightedPreferences(
          dislikedHomes.map(
            (home) => home.city,
          ),
        ),

      dislikedHomeTypes:
        calculateWeightedPreferences(
          dislikedHomes.map(
            (home) => home.homeType,
          ),
        ),

      dislikedAmenities:
        calculateWeightedPreferences(
          flattenAmenities(dislikedHomes),
        ),

      lastSearchLatitude:
        lastSearch?.latitude ?? null,

      lastSearchLongitude:
        lastSearch?.longitude ?? null,

      requiredAmenities: asList(preferences.essentialAmenities).map((value) =>
        value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase(),
      ),

      wantsCarExchange: preferences.carExchangeAccepted ?? null,

      desiredCapacity:
        preferences.travelersCount ??
        preferences.minCapacity ??
        preferences.maxCapacity ??
        null,
    };
  }

  private getRecentSearches(
    userId: string,
  ) {
    return this.prisma.searchHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  private getSwipedHomes(
    userId: string,
    direction: 'LIKE' | 'DISLIKE',
  ) {
    return this.prisma.swipe.findMany({
      where: {
        swiperId: userId,
        direction,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
      include: {
        home: true,
      },
    });
  }

  private async getFavoriteHomes(
    userId: string,
  ) {
    /*
     * Adapte ce bloc au nom exact au modèle Favorite.
     *
     * Exemple supposé :
     * Favorite { userId, homeId, home }
     */
    const favorites =
      await this.prisma.favorite.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
        include: {
          home: true,
        },
      });

    return favorites.map(
      (favorite) => favorite.home,
    );
  }
}