export type SupportedLocale = 'fr' | 'en';

export const STAY_DURATIONS = [
  '1w',
  '2w',
  '3w',
  '1m',
  '2m',
  '3m'
];

export interface TravelPreferences {
  preferredCountries: string[];
  preferredHomeTypes: string[];
  minCapacity: number | null;
  maxCapacity: number | null;
  carExchangeAccepted: boolean | null;
  flexibleDates: boolean | null;
  preferredCities?: string[];
  preferredContinents?: string[];
  stayDuration?: typeof STAY_DURATIONS[number] | null;
  preferredSeasons?: string[];
  essentialAmenities?: string[];
  preferredEnvironments?: string[];
  travelersCount?: number | null;
  travelingWithChildren?: boolean | null;
  petsAccepted?: boolean | null;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number | null; 
  avatarUrl: string | null;
  bio: string | null;
  country: string | null;
  nationality: string | null;
  phone: string | null;
  birthDate: string | null; // ISO date string  
  languages: string[];
  preferredLocale: SupportedLocale;
  travelPreferences: TravelPreferences;
  averageRating?: number | null;
  reviewsCount?: number;
  exchangesCount?: number;
  homesCount?: number;
}

export interface MyHome {
  id: string;
  title: string;
  city: string;
  country: string;
  imageUrl: string | null;
  averageRating?: number | null;
  reviewsCount?: number;
  bedrooms?: number | null;
  beds?: number | null;
  isAvailable?: boolean;
  pricePerNight?: number | null;
}

export interface FavoriteHome {
  id: string;
  title: string;
  city: string;
  country: string;
  imageUrl: string | null;
  averageRating?: number | null;
  reviewsCount?: number;
  bedrooms?: number | null;
  beds?: number | null;
  pricePerNight?: number | null;
  ownerAvatarUrl?: string | null;
  seasonalBadge?: string | null;
  isAvailable?: boolean;
}