import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSupportRequestHttpDto {
  @IsString()
  @IsIn(['account', 'booking', 'exchange', 'payment', 'technical', 'other'])
  topic!: 'account' | 'booking' | 'exchange' | 'payment' | 'technical' | 'other';

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}