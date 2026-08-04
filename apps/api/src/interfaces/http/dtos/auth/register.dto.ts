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

  // Doit etre une date ISO-8601 complete : Prisma rejette "1990-01-01" et
  // l'erreur remonte en 500. Le mobile envoie deja Date.toISOString().
  @IsOptional()
  @IsISO8601()
  birthDate?: string;
}
