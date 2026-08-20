import { Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { PasswordResetTokenExpiredError } from 'src/domain/auth/errors/expired-password.errors';
import { InvalidPasswordResetTokenError } from 'src/domain/auth/errors/invalid-password-reset-token.error';
import { PasswordResetTokenRepository } from 'src/domain/auth/repositories/password-reset-token-repository';

@Injectable()
export class JwtPasswordResetTokenAdapter implements PasswordResetTokenRepository {
  constructor(private readonly jwtService: JwtService) {}

  async sign(
    payload: { userId: string },
    expiresInSeconds: number,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload.userId, type: 'password_reset' },
      {
        secret: process.env.JWT_RESET_SECRET || 'dev-reset-secret',
        expiresIn: expiresInSeconds,
      },
    );
  }

  async verify(token: string): Promise<{ userId: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_RESET_SECRET || 'dev-reset-secret',
      });

      if (!decoded?.sub || decoded?.type !== 'password_reset') {
        throw new InvalidPasswordResetTokenError();
      }

      return { userId: decoded.sub };
    } catch (e: any) {
      if (e instanceof TokenExpiredError) {
        throw new PasswordResetTokenExpiredError();
      }
      if (e instanceof JsonWebTokenError) {
        throw new InvalidPasswordResetTokenError();
      }
      throw e;
    }
  }
}
