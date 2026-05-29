import { IsDateString, IsEnum } from 'class-validator';

export enum AvailabilityTypeDto {
  AVAILABLE = 'AVAILABLE',
  BLOCKED = 'BLOCKED',
}

export class CreateHomeAvailabilityDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsEnum(AvailabilityTypeDto)
  type!: AvailabilityTypeDto;
}