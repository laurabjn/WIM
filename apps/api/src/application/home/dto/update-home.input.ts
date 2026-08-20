import { VehicleFuelType } from "./vehicle-fuel-type";

export interface UpdateHomeInput {
  homeId: string;
  requesterId: string;
  title?: string;
  description?: string;
  address?: string | null;
  city?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity?: number;
  beds?: number;
  bedrooms?: number;
  bathrooms?: number;
  homeType?: string;
  category?: 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE' | null;
  amenities?: string[];
  isAvailableForExchange?: boolean;
  pricePerNight?: number | null;
  carExchangeAccepted?: boolean;
  vehicle?: {
    brand?: string | null;
    model?: string | null;
    seats?: number | null;
    type?: string | null;
    fuelType?: VehicleFuelType | null;
    imageUrl?: string | null;
  } | null;
}