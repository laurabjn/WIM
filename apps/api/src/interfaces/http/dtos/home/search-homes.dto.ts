import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const EQUIPEMENTS_MAX = 12;

export class SearchHomesDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bedrooms?: number;

  @IsOptional()
  @IsString()
  homeType?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((element) => element.trim())
          .filter(Boolean)
          .slice(0, EQUIPEMENTS_MAX)
      : value,
  )
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsIn(['NATURE', 'BEACH', 'CITY', 'CULTURE'])
  category?: 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}