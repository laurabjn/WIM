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
  category: string;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  homeType: string;
  amenities: string[];
  carExchangeAccepted: boolean;
  photos: HomePhoto[];
  vehicle?: Vehicle | null;
  isAvailableForExchange: boolean;
  pricePerNight?: number | null;
  isFavorite?: boolean;
  averageRating?: number | null;
  reviewsCount?: number | null;
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

export interface Vehicle {
  id: string;
  homeId: string;
  brand?: string | null;
  model?: string | null;
  seats?: number | null;
  type?: string | null;
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
  vehicle?: Vehicle | null;
  pricePerNight?: number | null;
  isFavorite?: boolean;
}

export interface UpdateHomeInput extends Partial<CreateHomeInput> {}