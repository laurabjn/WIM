import { RecommendationUserMock, SwipeHomeMock } from '@wim/shared/swipe/swipeRecommendation.types';
import { swipeHomesMock } from './swipeHomeMocks';

function getIds(
  predicate: (home: SwipeHomeMock) => boolean,
  limit: number,
): string[] {
  return swipeHomesMock
    .filter(predicate)
    .slice(0, limit)
    .map((home) => home.id);
}

/**
 * Scénario 1 :
 * aime le sud-ouest, les maisons/villas,
 * la piscine, le jardin et les logements spacieux.
 */
export const southWestFamilyUserMock:
  RecommendationUserMock = {
  id: 'current-user',

  likedHomeIds: getIds(
    (home) =>
      ['Bordeaux', 'Biarritz', 'Arcachon'].includes(
        home.city,
      ) &&
      (
        home.amenities.includes('Piscine') ||
        home.amenities.includes('Jardin') ||
        home.amenities.includes('Plage')
      ),
    7,
  ),

  favoriteHomeIds: getIds(
    (home) =>
      ['HOUSE', 'VILLA', 'COTTAGE'].includes(
        home.homeType,
      ) &&
      home.beds >= 4,
    5,
  ),

  dislikedHomeIds: getIds(
    (home) =>
      home.homeType === 'APARTMENT' &&
      home.beds <= 2,
    7,
  ),

  searchHistory: [
    {
      city: 'Bordeaux',
      country: 'France',
      beds: 5,
      homeType: 'HOUSE',
      amenities: ['Jardin', 'Piscine', 'Wifi'],
      createdAt: '2026-07-19T18:00:00.000Z',
    },
    {
      city: 'Biarritz',
      country: 'France',
      beds: 4,
      homeType: 'VILLA',
      amenities: ['Plage', 'Terrasse'],
      createdAt: '2026-07-18T12:00:00.000Z',
    },
    {
      city: 'Arcachon',
      country: 'France',
      beds: 6,
      homeType: 'HOUSE',
      amenities: ['Plage', 'Jardin'],
      createdAt: '2026-07-16T09:00:00.000Z',
    },
  ],
};

/**
 * Scénario 2 :
 * aime les appartements urbains,
 * Paris/Lyon, les petites capacités et les prix bas.
 */
export const cityCoupleUserMock:
  RecommendationUserMock = {
  id: 'current-user',

  likedHomeIds: getIds(
    (home) =>
      ['Paris', 'Lyon'].includes(home.city) &&
      ['APARTMENT', 'LOFT'].includes(home.homeType),
    8,
  ),

  favoriteHomeIds: getIds(
    (home) =>
      ['APARTMENT', 'LOFT'].includes(home.homeType) &&
      home.beds <= 3 &&
      home.pricePerNight <= 350,
    5,
  ),

  dislikedHomeIds: getIds(
    (home) =>
      ['CABIN', 'COTTAGE'].includes(home.homeType) ||
      home.beds >= 6,
    8,
  ),

  searchHistory: [
    {
      city: 'Paris',
      country: 'France',
      beds: 2,
      homeType: 'APARTMENT',
      amenities: ['Wifi', 'Métro'],
      createdAt: '2026-07-19T19:00:00.000Z',
    },
    {
      city: 'Lyon',
      country: 'France',
      beds: 2,
      homeType: 'LOFT',
      amenities: ['Centre-ville', 'Balcon'],
      createdAt: '2026-07-17T14:00:00.000Z',
    },
  ],
};

/**
 * Scénario 3 :
 * aime la montagne, la nature,
 * les cabanes et les cheminées.
 */
export const natureMountainUserMock:
  RecommendationUserMock = {
  id: 'current-user',

  likedHomeIds: getIds(
    (home) =>
      ['Annecy', 'Chamonix'].includes(home.city) ||
      home.amenities.includes('Montagne') ||
      home.amenities.includes('Nature'),
    8,
  ),

  favoriteHomeIds: getIds(
    (home) =>
      ['CABIN', 'COTTAGE'].includes(home.homeType) &&
      (
        home.amenities.includes('Cheminée') ||
        home.amenities.includes('Nature')
      ),
    5,
  ),

  dislikedHomeIds: getIds(
    (home) =>
      ['Paris', 'Lyon', 'San Francisco'].includes(
        home.city,
      ),
    8,
  ),

  searchHistory: [
    {
      city: 'Chamonix',
      country: 'France',
      beds: 4,
      homeType: 'CABIN',
      amenities: ['Montagne', 'Cheminée', 'Nature'],
      createdAt: '2026-07-19T20:00:00.000Z',
    },
    {
      city: 'Annecy',
      country: 'France',
      beds: 3,
      homeType: 'COTTAGE',
      amenities: ['Lac', 'Nature'],
      createdAt: '2026-07-18T08:00:00.000Z',
    },
  ],
};

export type RecommendationScenarioName =
  | 'SOUTH_WEST_FAMILY'
  | 'CITY_COUPLE'
  | 'NATURE_MOUNTAIN';

export const recommendationScenarios: Record<
  RecommendationScenarioName,
  RecommendationUserMock
> = {
  SOUTH_WEST_FAMILY: southWestFamilyUserMock,
  CITY_COUPLE: cityCoupleUserMock,
  NATURE_MOUNTAIN: natureMountainUserMock,
};