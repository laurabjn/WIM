import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateHomeDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  city!: string;

  @IsString()
  country!: string;

  // lat : -90..90
  @Min(-90)
  @Max(90)
  latitude!: number;

  // lng : -180..180
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsInt()
  capacity!: number;

  @IsString()
  homeType!: string;
}
