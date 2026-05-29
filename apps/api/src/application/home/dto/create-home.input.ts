import { VehicleFuelType } from "./vehicle-fuel-type";

export interface CreateHomeInput {
  ownerId: string;
  title: string;
  description: string;
  address?: string | null;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity: number;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  homeType: string;
  amenities: string[];
  isAvailableForExchange: boolean;
  pricePerNight?: number | null;
  averageRating?: number | null;
  reviewCount: number;
  carExchangeAccepted: boolean;
  vehicle?: {
    brand?: string | null;
    model?: string | null;
    seats?: number | null;
    type?: string | null;
    fuelType?: VehicleFuelType | null;
    images?: string[] | null;
  } | null;
}