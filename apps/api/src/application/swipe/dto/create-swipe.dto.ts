import { IsEnum, IsString } from 'class-validator';

export enum SwipeDirectionDto {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}

export class CreateSwipeDto {
  @IsString()
  targetUserId: string;

  @IsString()
  homeId!: string;

  @IsEnum(SwipeDirectionDto)
  direction: SwipeDirectionDto;
}