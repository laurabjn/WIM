import { IsBoolean, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsBoolean()
  isAdmin?: boolean;
}
