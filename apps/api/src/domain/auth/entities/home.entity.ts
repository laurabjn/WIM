export type HomeType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'STUDIO'
  | 'VILLA'
  | 'OTHER';

export interface VehicleEntity {
  id: string;
  homeId: string;
  brand?: string | null;
  model?: string | null;
  seats?: number | null;
  type?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomePhotoEntity {
  id: string;
  homeId: string;
  url: string;
  position: number;
  createdAt: Date;
}

export interface HomeOwnerEntity {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  createdAt: Date;
}

export interface HomeEntity {
  id: string;
  ownerId: string;
  owner?: HomeOwnerEntity | null;
  title: string;
  description: string;
  address?: string | null;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity: number;
  beds: number;
  bathrooms: number;
  bedrooms: number;
  homeType: string;
  amenities: string[];
  isAvailableForExchange: boolean;
  pricePerNight?: number | null;
  averageRating?: number | null;
  reviewCount: number;
  carExchangeAccepted: boolean;
  photos: HomePhotoEntity[];
  vehicle?: VehicleEntity | null;
  createdAt: Date;
  updatedAt: Date;
}