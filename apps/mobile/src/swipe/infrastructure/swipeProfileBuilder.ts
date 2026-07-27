import {
    RecommendationProfile,
    RecommendationUserMock,
    SwipeHomeMock
} from '@wim/shared/swipe/swipeRecommendation.types';
import {
  calculateAverage,
  calculateWeightedPreferences,
} from './swipePreferenceCalculator';

export class SwipeMockProfileBuilder {
  build(
    user: RecommendationUserMock,
    homes: SwipeHomeMock[],
  ): RecommendationProfile {
    const likedHomes = homes.filter(
      (home) =>
        user.likedHomeIds.includes(home.id),
    );

    const favoriteHomes = homes.filter(
      (home) =>
        user.favoriteHomeIds.includes(home.id),
    );

    const dislikedHomes = homes.filter(
      (home) =>
        user.dislikedHomeIds.includes(home.id),
    );

    /*
     * Importance :
     *
     * Like         : 2
     * Favori       : 3
     * Recherche    : selon la récence
     * Dislike      : 2
     */

    const preferredCities =
      calculateWeightedPreferences([
        ...likedHomes.map((home) => ({
          value: home.city,
          importance: 2,
        })),

        ...favoriteHomes.map((home) => ({
          value: home.city,
          importance: 3,
        })),

        ...user.searchHistory.map(
          (search, index) => ({
            value: search.city,
            importance: Math.max(
              1,
              4 - index,
            ),
          }),
        ),
      ]);

    const preferredCountries =
      calculateWeightedPreferences([
        ...likedHomes.map((home) => ({
          value: home.country,
          importance: 2,
        })),

        ...favoriteHomes.map((home) => ({
          value: home.country,
          importance: 3,
        })),

        ...user.searchHistory.map(
          (search, index) => ({
            value: search.country,
            importance: Math.max(
              1,
              4 - index,
            ),
          }),
        ),
      ]);

    const preferredHomeTypes =
      calculateWeightedPreferences([
        ...likedHomes.map((home) => ({
          value: home.homeType,
          importance: 2,
        })),

        ...favoriteHomes.map((home) => ({
          value: home.homeType,
          importance: 3,
        })),

        ...user.searchHistory.map(
          (search, index) => ({
            value: search.homeType,
            importance: Math.max(
              1,
              4 - index,
            ),
          }),
        ),
      ]);

    const preferredAmenities =
      calculateWeightedPreferences([
        ...likedHomes.flatMap((home) =>
          home.amenities.map((amenity) => ({
            value: amenity,
            importance: 2,
          })),
        ),

        ...favoriteHomes.flatMap((home) =>
          home.amenities.map((amenity) => ({
            value: amenity,
            importance: 3,
          })),
        ),

        ...user.searchHistory.flatMap(
          (search, searchIndex) =>
            (search.amenities ?? []).map(
              (amenity) => ({
                value: amenity,
                importance: Math.max(
                  1,
                  4 - searchIndex,
                ),
              }),
            ),
        ),
      ]);

    const averageBeds =
      calculateAverage([
        ...likedHomes.map((home) => ({
          value: home.beds,
          importance: 2,
        })),

        ...favoriteHomes.map((home) => ({
          value: home.beds,
          importance: 3,
        })),

        ...user.searchHistory
          .filter(
            (
              search,
            ): search is typeof search & {
              beds: number;
            } =>
              typeof search.beds ===
              'number',
          )
          .map((search, index) => ({
            value: search.beds,
            importance: Math.max(
              1,
              4 - index,
            ),
          })),
      ]);

    const averagePrice =
      calculateAverage([
        ...likedHomes.map((home) => ({
          value: home.pricePerNight,
          importance: 2,
        })),

        ...favoriteHomes.map((home) => ({
          value: home.pricePerNight,
          importance: 3,
        })),
      ]);

    return {
      preferredCities,
      preferredCountries,
      preferredHomeTypes,
      preferredAmenities,

      dislikedCities:
        calculateWeightedPreferences(
          dislikedHomes.map((home) => ({
            value: home.city,
            importance: 2,
          })),
        ),

      dislikedHomeTypes:
        calculateWeightedPreferences(
          dislikedHomes.map((home) => ({
            value: home.homeType,
            importance: 2,
          })),
        ),

      dislikedAmenities:
        calculateWeightedPreferences(
          dislikedHomes.flatMap((home) =>
            home.amenities.map(
              (amenity) => ({
                value: amenity,
                importance: 1,
              }),
            ),
          ),
        ),

      averageBeds,
      averagePrice,
    };
  }
}