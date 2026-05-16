import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OwnerHomeDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;
    
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;
    
  @IsString()
  createdAt!: string;
}