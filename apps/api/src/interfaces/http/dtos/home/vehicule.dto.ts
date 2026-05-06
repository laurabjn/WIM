import { Type } from "class-transformer";
import { IsOptional, IsString, IsInt, Min } from "class-validator";

export class VehicleDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsString()
  type?: string;
}