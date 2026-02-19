import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user.usecase';
import { UserAlreadyExistsError } from 'src/domain/errors/user-already-exist.error';
import { RegisterDto } from '../dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    try {
      const user = await this.registerUserUseCase.execute({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });

      return { user };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new BadRequestException('Email already in use');
      }
      throw error;
    }
  }
}
