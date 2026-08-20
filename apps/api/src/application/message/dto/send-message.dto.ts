import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  // Sans cette declaration, le filtre global rejetterait le champ et l'envoi
  // d'une reponse citee echouerait entierement.
  @IsOptional()
  @IsString()
  replyToId?: string;
}