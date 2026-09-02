import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserUseCase } from 'src/application/auth/use-cases/login-user.usecase';
import { RegisterUserUseCase } from 'src/application/auth/use-cases/register-user.usecase';
import { InvalidCredentialsError } from 'src/domain/auth/errors/invalid-credentiels.errors';
import { UserAlreadyExistsError } from 'src/domain/auth/errors/user-already-exist.error';
import { LoginDto } from '../dtos/auth/login.dto';
import { RegisterDto } from '../dtos/auth/register.dto';
import { ResetPasswordUseCase } from 'src/application/auth/use-cases/reset-password.usecase';
import { RequestPasswordResetUseCase } from 'src/application/auth/use-cases/request-password-reset.usecase';
import { ResetPasswordDto } from '../dtos/auth/reset-password.dto';
import { InvalidPasswordResetTokenError } from 'src/domain/auth/errors/invalid-password-reset-token.error';
import { PasswordResetTokenExpiredError } from 'src/domain/auth/errors/expired-password.errors';
import { ForgotPasswordDto } from '../dtos/auth/forgot-password.dto';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';
import { StartIdentityVerificationUseCase } from 'src/application/auth/use-cases/start-identity-verification.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly jwtService: JwtService,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly startIdentityVerificationUseCase: StartIdentityVerificationUseCase,
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
        birthDate: dto.birthDate,
        nationality: dto.nationality,
        country: dto.country,
        phone: dto.phone,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      });

      const payload = {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        birthDate: user.birthDate,
        nationality: user.nationality,
        country: user.country,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      const { redirectUrl } =
        await this.startIdentityVerificationUseCase.execute({
          userId: user.id,
        });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          identityStatus: IdentityStatus.IN_PROGRESS,
          birthDate: user.birthDate,
          nationality: user.nationality,
          country: user.country,
          phone: user.phone,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
        },
        identityRedirectUrl: redirectUrl,
      };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new BadRequestException(
          'Un compte existe déjà avec cette adresse.',
        );
      }

      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken?: string }) {
    if (!body?.refreshToken) {
      throw new UnauthorizedException('Jeton de rafraîchissement manquant.');
    }

    let payload: { sub: string; email: string; isAdmin?: boolean };

    try {
      payload = await this.jwtService.verifyAsync(body.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Session expirée, reconnectez-vous.');
    }

    const charge = {
      sub: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin === true,
    };

    const accessToken = await this.jwtService.signAsync(charge, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    });

    const refreshToken = await this.jwtService.signAsync(charge, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    });

    return { accessToken, refreshToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    try {
      const user = await this.loginUserUseCase.execute({
        email: dto.email,
        password: dto.password,
      });

      const payload = {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin === true,
      };

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
      console.error('LOGIN ERROR FULL =', error);
      if (error instanceof InvalidCredentialsError) {
        throw new BadRequestException('Invalid email or password');
      }
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(/*@Res({ passthrough: true }) res: Response*/) {
    return {
      message: 'Logged out',
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.requestPasswordResetUseCase.execute(dto.email, dto.locale);

    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    try {
      await this.resetPasswordUseCase.execute({
        token: dto.token,
        newPassword: dto.newPassword,
      });
      return { message: 'Password has been reset successfully.' };
    } catch (e) {
      if (e instanceof InvalidPasswordResetTokenError) {
        throw new BadRequestException('Invalid password reset token');
      }
      if (e instanceof PasswordResetTokenExpiredError) {
        throw new BadRequestException('Password reset token has expired');
      }
      throw new BadRequestException('Unable to reset password');
    }
  }
}
