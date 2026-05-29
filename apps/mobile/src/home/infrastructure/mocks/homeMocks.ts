import type { Home } from '@wim/shared/home/home.type';
import { reviewMocks } from './reviewMocks';
import { vehiculeMock } from './vehiculeMocks';
import { amenitiesMocks } from './amenitiesMocks';

export const publicUserHomesMock: Home[] = [
  {
    id: 'home-1',

    ownerId: 'user-1',

    title: 'Terry House',

    description:
        'Grande maison lumineuse avec jardin et vue sur la ville.',
    
    category: 'Maison',
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    homeType: 'Entièrement équipé',

    city: 'San Francisco',
    country: 'États-Unis',

    latitude: 37.7749,
    longitude: -122.4194,

    capacity: 5,

    averageRating: 4.8,
    reviewsCount: reviewMocks.length,

    amenities: amenitiesMocks,

    reviews: reviewMocks,

    carExchangeAccepted: true,

    vehicle: vehiculeMock,

    photos: [
      {
        id: 'photo-1',
        homeId: 'home-1',
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
        position: 0,
      },
    ],

    owner: {
      id: 'user-1',
      firstName: 'Terry',
      lastName: 'Smith',
      avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 4.9,
      createdAt: '2018-01-01T00:00:00.000Z',
    },

    availabilities: [],
    isAvailableForExchange: true,

    pricePerNight: 150,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },

  {
    id: 'home-2',

    ownerId: 'user-1',

    title: 'Modern Apartment',

    description:
        'Appartement moderne au cœur de San Francisco.',
    
    category: 'Appartement',
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    homeType: 'Entièrement équipé',

    city: 'San Francisco',
    country: 'États-Unis',

    latitude: 37.7749,
    longitude: -122.4194,

    capacity: 2,

    averageRating: 4.5,
    reviewsCount: 8,

    amenities: amenitiesMocks,

    reviews: [],

    carExchangeAccepted: false,

    vehicle: null,

    photos: [
      {
        id: 'photo-2',
        homeId: 'home-2',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        position: 0,
      },
    ],

    owner: {
      id: 'user-1',
      firstName: 'Terry',
      lastName: 'Smith',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 4.9,
      createdAt: '2018-01-01T00:00:00.000Z',
    },

    availabilities: [],
    isAvailableForExchange: false,

    pricePerNight: 120,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];