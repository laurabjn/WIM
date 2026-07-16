import type { Home } from '@wim/shared/home/home.type';
import { reviewMocks } from './reviewMocks';
import { vehiculeMock } from './vehiculeMocks';
import { amenitiesMocks } from './amenitiesMocks';

export const heroByCategory = {
  NATURE: {
    title: 'SEDONA',
    exchanges: 42,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  },
  BEACH: {
    title: 'BIARRITZ',
    exchanges: 28,
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  },
  CITY: {
    title: 'TOKYO',
    exchanges: 64,
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
  },
  CULTURE: {
    title: 'ROME',
    exchanges: 35,
    image:
      'https://images.unsplash.com/photo-1525874684015-58379d421a52',
  },
};

export const publicUserHomesMock: Home[] = [
  {
    id: 'home-1',
    ownerId: 'user-1',

    title: 'Terry House',

    description:
      'Grande maison lumineuse avec jardin, terrasse et vue sur la ville. Le logement est idéal pour une famille souhaitant découvrir San Francisco dans un environnement calme.',

    address: '1250 California Street',
    category: 'Maison',
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    homeType: 'Entièrement équipé',

    city: 'San Francisco',
    country: 'États-Unis',

    latitude: 37.7917,
    longitude: -122.4169,

    capacity: 5,

    averageRating: 4.8,
    reviewsCount: reviewMocks.length,

    amenities: amenitiesMocks,
    reviews: reviewMocks,

    carExchangeAccepted: true,
    isAvailableForExchange: true,

    vehicle: vehiculeMock,

    photos: [
      {
        id: 'photo-1',
        homeId: 'home-1',
        url:
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
        position: 0,
      },
      {
        id: 'photo-1-2',
        homeId: 'home-1',
        url:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
        position: 1,
      },
      {
        id: 'photo-1-3',
        homeId: 'home-1',
        url:
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e',
        position: 2,
      },
      {
        id: 'photo-1-4',
        homeId: 'home-1',
        url:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
        position: 3,
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

    availabilities: [
      {
        id: 'availability-home-1-1',
        homeId: 'home-1',
        startDate: '2026-07-01',
        endDate: '2026-07-22',
        type: 'AVAILABLE',
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-01T10:00:00.000Z',
      },
      {
        id: 'availability-home-1-2',
        homeId: 'home-1',
        startDate: '2026-08-05',
        endDate: '2026-08-25',
        type: 'AVAILABLE',
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-01T10:00:00.000Z',
      },
    ],

    pricePerNight: 150,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },

  {
    id: 'home-2',
    ownerId: 'user-1',

    title: 'Modern Apartment',

    description:
      'Appartement moderne au cœur de San Francisco, proche des transports et des commerces.',

    address: '800 Market Street',
    category: 'Appartement',
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    homeType: 'Entièrement équipé',

    city: 'San Francisco',
    country: 'États-Unis',

    latitude: 37.7849,
    longitude: -122.4094,

    capacity: 2,

    averageRating: 4.5,
    reviewsCount: 0,

    amenities: amenitiesMocks,
    reviews: [],

    carExchangeAccepted: false,
    isAvailableForExchange: false,

    vehicle: null,

    photos: [
      {
        id: 'photo-2',
        homeId: 'home-2',
        url:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        position: 0,
      },
      {
        id: 'photo-2-2',
        homeId: 'home-2',
        url:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        position: 1,
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

    availabilities: [
      {
        id: 'availability-home-2-1',
        homeId: 'home-2',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        type: 'BLOCKED',
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-01T10:00:00.000Z',
      },
    ],

    pricePerNight: 120,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];