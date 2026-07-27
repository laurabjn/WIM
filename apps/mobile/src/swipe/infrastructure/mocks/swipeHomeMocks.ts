import { SwipeHomeMock, SwipeHomeType } from '@wim/shared/swipe/swipeRecommendation.types';

const cities = [
  {
    city: 'Bordeaux',
    country: 'France',
    latitude: 44.8378,
    longitude: -0.5792,
    defaultAmenities: ['Wifi', 'Jardin', 'Parking'],
  },
  {
    city: 'Biarritz',
    country: 'France',
    latitude: 43.4832,
    longitude: -1.5586,
    defaultAmenities: ['Wifi', 'Plage', 'Terrasse'],
  },
  {
    city: 'Arcachon',
    country: 'France',
    latitude: 44.6525,
    longitude: -1.1688,
    defaultAmenities: ['Plage', 'Terrasse', 'Parking'],
  },
  {
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    defaultAmenities: ['Wifi', 'Métro', 'Climatisation'],
  },
  {
    city: 'Lyon',
    country: 'France',
    latitude: 45.7640,
    longitude: 4.8357,
    defaultAmenities: ['Wifi', 'Centre-ville', 'Balcon'],
  },
  {
    city: 'Annecy',
    country: 'France',
    latitude: 45.8992,
    longitude: 6.1294,
    defaultAmenities: ['Nature', 'Lac', 'Parking'],
  },
  {
    city: 'Chamonix',
    country: 'France',
    latitude: 45.9237,
    longitude: 6.8694,
    defaultAmenities: ['Montagne', 'Cheminée', 'Nature'],
  },
  {
    city: 'Nice',
    country: 'France',
    latitude: 43.7102,
    longitude: 7.2620,
    defaultAmenities: ['Plage', 'Climatisation', 'Terrasse'],
  },
  {
    city: 'Austin',
    country: 'États-Unis',
    latitude: 30.2672,
    longitude: -97.7431,
    defaultAmenities: ['Jardin', 'Barbecue', 'Parking'],
  },
  {
    city: 'San Francisco',
    country: 'États-Unis',
    latitude: 37.7749,
    longitude: -122.4194,
    defaultAmenities: ['Wifi', 'Vue', 'Centre-ville'],
  },
  {
    city: 'Lisbonne',
    country: 'Portugal',
    latitude: 38.7223,
    longitude: -9.1393,
    defaultAmenities: ['Terrasse', 'Climatisation', 'Wifi'],
  },
  {
    city: 'Barcelone',
    country: 'Espagne',
    latitude: 41.3874,
    longitude: 2.1686,
    defaultAmenities: ['Plage', 'Balcon', 'Climatisation'],
  },
];

const homeTypes: SwipeHomeType[] = [
  'APARTMENT',
  'HOUSE',
  'VILLA',
  'CABIN',
  'LOFT',
  'COTTAGE',
];

const extraAmenities = [
  'Piscine',
  'Jardin',
  'Wifi',
  'Parking',
  'Animaux',
  'Enfants',
  'Voiture',
  'Barbecue',
  'Cheminée',
  'Climatisation',
  'Terrasse',
  'Balcon',
  'Nature',
  'Plage',
  'Montagne',
  'Lac',
  'Vue',
  'Salle de sport',
];

const photoUrls = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
];

const titlesByType: Record<SwipeHomeType, string[]> = {
  APARTMENT: [
    'Appartement lumineux',
    'Appartement avec vue',
    'Appartement en centre-ville',
  ],
  HOUSE: [
    'Maison familiale',
    'Maison avec jardin',
    'Maison chaleureuse',
  ],
  VILLA: [
    'Villa avec piscine',
    'Villa moderne',
    'Villa proche de la mer',
  ],
  CABIN: [
    'Cabane en pleine nature',
    'Cabane avec cheminée',
    'Cabane au calme',
  ],
  LOFT: [
    'Loft contemporain',
    'Loft lumineux',
    'Loft industriel',
  ],
  COTTAGE: [
    'Cottage romantique',
    'Cottage à la campagne',
    'Cottage avec jardin',
  ],
};

/**
 * Générateur pseudo-aléatoire déterministe.
 *
 * À chaque lancement de l’application, les mocks restent identiques.
 * Cela facilite énormément la comparaison des scores.
 */
function seededRandom(seed: number): number {
  const value = Math.sin(seed * 9999) * 10000;

  return value - Math.floor(value);
}

function pickFromArray<T>(
  values: T[],
  seed: number,
): T {
  const index = Math.floor(
    seededRandom(seed) * values.length,
  );

  return values[index];
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function createAmenities(
  cityAmenities: string[],
  seed: number,
): string[] {
  const generatedAmenities = [
    ...cityAmenities,
    pickFromArray(extraAmenities, seed + 1),
    pickFromArray(extraAmenities, seed + 2),
    pickFromArray(extraAmenities, seed + 3),
    pickFromArray(extraAmenities, seed + 4),
  ];

  return unique(generatedAmenities);
}

function createPhotos(
  seed: number,
): Array<{ url: string }> {
  const photosCount =
    2 + Math.floor(seededRandom(seed) * 4);

  return Array.from(
    { length: photosCount },
    (_, photoIndex) => ({
      url: photoUrls[
        (seed + photoIndex) % photoUrls.length
      ],
    }),
  );
}

function randomCoordinate(
  coordinate: number,
  offset = 0.003,
) {
  return (
    coordinate +
    (Math.random() * 2 - 1) * offset
  );
}

function createSwipeHome(
  index: number,
): SwipeHomeMock {
  const location =
    cities[index % cities.length];

  const homeType =
    homeTypes[index % homeTypes.length];

  const bedrooms =
    1 + Math.floor(seededRandom(index + 10) * 5);

  const beds =
    bedrooms +
    Math.floor(seededRandom(index + 20) * 4);

  const pricePerNight =
    90 +
    Math.floor(seededRandom(index + 30) * 520);

  const averageRating = Number(
    (
      3.5 +
      seededRandom(index + 40) * 1.5
    ).toFixed(1),
  );

  const reviewsCount =
    Math.floor(seededRandom(index + 50) * 150);

  const titlePrefix = pickFromArray(
    titlesByType[homeType],
    index + 60,
  );

  const bathrooms =
    1 +
    Math.floor(seededRandom(index + 16) * 3);

  const capacity =
    beds +
    Math.floor(seededRandom(index + 15) * 3);
  
  const carExchangeAccepted = seededRandom(index + 17) > 0.45;

  const description =
    `Profitez d'un séjour dans cette ${
      homeType.toLowerCase()
    } située à ${location.city}. 
    Le logement est entièrement équipé et idéal pour découvrir la région. 
    Vous profiterez d'un environnement calme ainsi que de nombreux équipements pour toute la famille.`;

  return {
    id: `home-${index + 1}`,
    ownerId: `user-${index + 2}`,
    owner: {
      id: `user-${index + 2}`,
      firstName: `Laura ${index + 1}`,
      lastName: `Laura ${index + 1}`,
      avatarUrl: photoUrls[(index + 5) % photoUrls.length],
    },
    title: `${titlePrefix} à ${location.city}`,
    city: location.city,
    country: location.country,
    latitude: randomCoordinate(location.latitude),
    longitude: randomCoordinate(location.longitude),
    capacity,
    homeType,
    bedrooms,
    beds,
    bathrooms,
    carExchangeAccepted,
    description,
    pricePerNight,
    averageRating,
    reviewsCount,
    amenities: createAmenities(
      location.defaultAmenities,
      index + 70,
    ),
    photos: createPhotos(index + 80),
  };
}

export const swipeHomesMock: SwipeHomeMock[] =
  Array.from(
    { length: 60 },
    (_, index) => createSwipeHome(index),
);

// export const swipeHomesMock = [
//   {
//     id: '1',
//     ownerId: 'user-2',
//     title: "L'appartement de Benoît",
//     city: 'San Francisco',
//     country: 'États-Unis',
//     bedrooms: 3,
//     beds: 5,
//     pricePerNight: 560,
//     averageRating: 4.6,
//     reviewsCount: 2,
//     amenities: ['Voiture', 'Animaux', 'Enfants', 'Jardin', 'Wifi', 'Nature', 'Piscine', 'Climatisation'],
//     photos: [
//       { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7' },
//       { url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29' },
//       { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750' },
//     ],
//   },
//   {
//     id: '2',
//     ownerId: 'user-3',
//     title: 'La maison des Millers',
//     city: 'Austin',
//     country: 'États-Unis',
//     bedrooms: 4,
//     beds: 6,
//     pricePerNight: 490,
//     averageRating: 4.9,
//     reviewsCount: 12,
//     amenities: ['Jardin', 'Wifi', 'Piscine', 'Barbecue', 'Parking'],
//     photos: [
//       { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233' },
//       { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' },
//     ],
//   },
//   {
//     id: '3',
//     ownerId: 'user-4',
//     title: 'Villa proche de la plage',
//     city: 'Biarritz',
//     country: 'France',
//     bedrooms: 2,
//     beds: 3,
//     pricePerNight: 390,
//     averageRating: 4.8,
//     reviewsCount: 7,
//     amenities: ['Plage', 'Terrasse', 'Wifi', 'Animaux', 'Climatisation'],
//     photos: [
//       { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
//       { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2' },
//     ],
//   },
//   {
//     id: '4',
//     ownerId: 'user-5',
//     title: 'Maison calme en pleine nature',
//     city: 'Sedona',
//     country: 'USA',
//     bedrooms: 3,
//     beds: 4,
//     pricePerNight: 420,
//     averageRating: 4.7,
//     reviewsCount: 8,
//     amenities: ['Nature', 'Cheminée', 'Jardin', 'Parking', 'Wifi'],
//     photos: [
//       { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee' },
//       { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e' },
//     ],
//   },
// ];