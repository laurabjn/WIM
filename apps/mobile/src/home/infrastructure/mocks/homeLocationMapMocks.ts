import type { Home } from '@wim/shared/home/home.type';

export const homeLocationSanFranciscoMock = {
  id: 'home-location-sf',
  title: 'Maison à San Francisco',
  address: '1250 California Street',
  city: 'San Francisco',
  country: 'États-Unis',
  latitude: 37.7917,
  longitude: -122.4169,
} as Home;

export const homeLocationBordeauxMock = {
  id: 'home-location-bordeaux',
  title: 'Appartement à Bordeaux',
  address: '12 rue Sainte-Catherine',
  city: 'Bordeaux',
  country: 'France',
  latitude: 44.8378,
  longitude: -0.5792,
} as Home;

export const homeLocationWithoutCoordinatesMock = {
  id: 'home-location-empty',
  title: 'Logement sans coordonnées',
  address: 'Adresse inconnue',
  city: 'Rome',
  country: 'Italie',
  latitude: null,
  longitude: null,
} as Home;