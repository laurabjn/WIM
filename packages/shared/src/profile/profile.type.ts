import { STAY_DURATIONS } from '../utils/travelOption';

export type SupportedLocale = 'fr' | 'en';

export { STAY_DURATIONS };

export enum IdentityStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface TravelPreferences {
  preferredCountries: string[];
  preferredHomeTypes: string[];
  minCapacity: number | null;
  maxCapacity: number | null;
  carExchangeAccepted: boolean | null;
  flexibleDates: boolean | null;
  preferredCities?: string[];
  preferredContinents?: string[];
  preferredDestinationsByRegion?: Record<string, string[]>;
  stayDuration?: string | null;
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
  identityStatus?: IdentityStatus | null;
  profileVisible?: boolean;
  showAge?: boolean;
  dataSharing?: boolean;
  /** Statut court du moment, null passe un jour. */
  status?: string | null;
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