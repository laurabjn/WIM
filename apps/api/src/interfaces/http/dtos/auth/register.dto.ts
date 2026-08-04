import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre',
  })
  password!: string;

  // Ces champs sont facultatifs a l'inscription. Sans @IsOptional(), un client
  // qui n'envoie pas la cle (JSON.stringify omet les valeurs undefined, par
  // exemple quand aucune photo de profil n'est choisie) recevait un 400.
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Prisma exige un horodatage complet : "1990-01-01" le fait echouer en 500,
  // alors que c'est une date ISO-8601 parfaitement valide. On normalise donc
  // vers un ISO complet avant validation. Une valeur non reconnue est laissee
  // telle quelle pour que @IsISO8601 la rejette proprement en 400.
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string' || value === '') return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  })
  @IsISO8601()
  birthDate?: string;
}
