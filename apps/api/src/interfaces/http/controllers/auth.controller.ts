import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user.usecase';
import { UserAlreadyExistsError } from 'src/domain/errors/user-already-exist.error';
import { RegisterDto } from '../dtos/register.dto';
import { InvalidCredentialsError } from 'src/domain/errors/invalid-credentiels.errors';
import { LoginUserUseCase } from 'src/application/use-cases/login-user.usecase';
import { LoginDto } from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

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

      const { passwordHash, ...safeUser } = user as any;

      return { user: safeUser };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new BadRequestException('Email already in use');
      }
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    try {
      const user = await this.loginUserUseCase.execute({
        email: dto.email,
        password: dto.password,
      });

      const payload = { sub: user.id, email: user.email };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new BadRequestException('Invalid email or password');
      }
      throw error;
    }
  }
}
