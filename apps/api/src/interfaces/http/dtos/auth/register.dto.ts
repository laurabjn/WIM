import {
  IsBoolean,
  IsEmail,
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

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsBoolean()
  isAdmin?: boolean;

  @IsString()
  avatarUrl?: string;

  @IsString()
  bio?: string;

  @IsString()
  country?: string;

  @IsString()
  nationality?: string;

  @IsString()
  phone?: string;

  @IsString()
  birthDate?: string;
}
