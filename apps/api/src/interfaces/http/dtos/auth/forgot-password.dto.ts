import { IsEmail, IsIn } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;

  @IsIn(['fr', 'en'])
  locale!: 'fr' | 'en';
}
