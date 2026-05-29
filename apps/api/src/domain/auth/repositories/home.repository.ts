import { VehicleFuelType } from 'src/application/home/dto/vehicle-fuel-type';
import { HomeEntity, HomePhotoEntity } from '../entities/home.entity';

export interface VehicleRepositoryData {
  brand?: string | null;
  model?: string | null;
  seats?: number | null;
  type?: string | null;
  fuelType?: VehicleFuelType | null;
  imageUrl?: string | null;
}

export interface HomeOwnerRepositoryData {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  createdAt: Date;
}

export interface CreateHomeRepositoryData {
  ownerId: string;
  owner?: HomeOwnerRepositoryData | null;
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
  vehicle?: VehicleRepositoryData | null;
}

export interface UpdateHomeRepositoryData {
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
  amenities?: string[];
  isAvailableForExchange?: boolean;
  pricePerNight?: number | null;
  averageRating?: number | null;
  reviewCount?: number;
  carExchangeAccepted?: boolean;
  vehicle?: VehicleRepositoryData | null;
}

export interface HomeRepository {
  create(data: CreateHomeRepositoryData): Promise<HomeEntity>;
  findAll(): Promise<HomeEntity[]>;
  findById(id: string): Promise<HomeEntity | null>;
  findByOwnerId(ownerId: string): Promise<HomeEntity[]>;
  update(id: string, data: UpdateHomeRepositoryData): Promise<HomeEntity>;
  delete(id: string): Promise<void>;

  addPhoto(homeId: string, url: string, position: number): Promise<HomePhotoEntity>;
  removePhoto(photoId: string): Promise<void>;
}