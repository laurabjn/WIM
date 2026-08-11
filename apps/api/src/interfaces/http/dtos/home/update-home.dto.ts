import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleDto } from '../create-home.dto';

export class UpdateHomeDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  city!: string;

  @IsString()
  country!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  beds!: number;
  
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bathrooms!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  bedrooms!: number;

  @IsString()
  homeType!: string;

  @IsOptional()
  @IsIn(['NATURE', 'BEACH', 'CITY', 'CULTURE'])
  category?: 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';

  @IsArray()
  @IsString({ each: true })
  amenities!: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailableForExchange?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pricePerNight?: number;

  @Type(() => Boolean)
  @IsBoolean()
  carExchangeAccepted!: boolean;
  
  @IsOptional()
  @IsObject()
  vehicle?: VehicleDto;
}