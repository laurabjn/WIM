import { HomeAvailability } from "./homeAvailability.type";

export type HomeCategory = 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';

export interface Home {
  id: string;
  ownerId: string;
  owner: HomeOwner;
  title: string;
  description: string;
  address?: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity: number;
  category: HomeCategory | null;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  homeType: string;
  amenities: string[];
  carExchangeAccepted: boolean;
  photos: HomePhoto[];
  vehicle?: Vehicule | null;
  availabilities?: HomeAvailability[];
  isAvailableForExchange: boolean;
  occupiedByExchange?: boolean;
  pricePerNight?: number | null;
  isFavorite?: boolean;
  averageRating?: number | null;
  reviewsCount?: number | null;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface HomeOwner {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  rating?: number | null;
  createdAt: string;
}

export type VehicleFuelType =
  | 'GASOLINE'
  | 'HYBRID'
  | 'DIESEL'
  | 'ELECTRIC';

export interface Vehicule {
  id: string;
  homeId: string;
  brand?: string | null;
  model?: string | null;
  seats?: number | null;
  type?: string | null;
  fuelType?: VehicleFuelType | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HomePhoto {
  id: string;
  homeId: string;
  url: string;
  position: number;
}

export type PickedPhoto = {
  uri: string;
  name: string;
  type: string;
};

export type Review = {
  id: string;
  score: number;
  comment: string;
  createdAt: string;
  reply?: string | null;
  replyAt?: string | null;
  author: {
    id: string;
    firstName?: string | null;
    avatarUrl?: string | null;
    createdAt?: string | null;
  };
};

export interface CreateHomeInput {
  title: string;
  description: string;
  address?: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  homeType: string;
  amenities: string[];
  isAvailableForExchange: boolean;
  carExchangeAccepted: boolean;
  photos: HomePhoto[];
  averageRating?: number | null;
  reviewsCount?: number | null;
  vehicle?: Vehicule | null;
  pricePerNight?: number | null;
  isFavorite?: boolean;
}

export interface UpdateHomeInput extends Partial<CreateHomeInput> {}