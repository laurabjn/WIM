import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import { AlreadySwipedError } from 'src/domain/auth/errors/already-swipe.error';
import { ForbiddenHomeAccessError } from 'src/domain/auth/errors/forbidden-home-access.error';
import { HomeNotFoundError } from 'src/domain/auth/errors/home-not-found.error';
import { InvalidCredentialsError } from 'src/domain/auth/errors/invalid-credentiels.errors';
import { InvalidPasswordResetTokenError } from 'src/domain/auth/errors/invalid-password-reset-token.error';
import { InvalidSwipeTargetError } from 'src/domain/auth/errors/ivalid-swipe-target.error';
import { PasswordResetTokenExpiredError } from 'src/domain/auth/errors/expired-password.errors';
import { UserAlreadyExistsError } from 'src/domain/auth/errors/user-already-exist.error';
import { UserBlockedError } from 'src/domain/auth/errors/user-blocked.error';

const STATUTS: Record<string, HttpStatus> = {
  HomeNotFoundError: HttpStatus.NOT_FOUND,
  ForbiddenHomeAccessError: HttpStatus.FORBIDDEN,
  UserBlockedError: HttpStatus.FORBIDDEN,
  InvalidCredentialsError: HttpStatus.UNAUTHORIZED,
  InvalidPasswordResetTokenError: HttpStatus.BAD_REQUEST,
  PasswordResetTokenExpiredError: HttpStatus.BAD_REQUEST,
  UserAlreadyExistsError: HttpStatus.CONFLICT,
  AlreadySwipedError: HttpStatus.CONFLICT,
  InvalidSwipeTargetError: HttpStatus.BAD_REQUEST,
};

@Catch(
  AlreadySwipedError,
  ForbiddenHomeAccessError,
  HomeNotFoundError,
  InvalidCredentialsError,
  InvalidPasswordResetTokenError,
  InvalidSwipeTargetError,
  PasswordResetTokenExpiredError,
  UserAlreadyExistsError,
  UserBlockedError,
)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const statut =
      STATUTS[exception.name] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    if (statut === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception.message, exception.stack);
    }

    host.switchToHttp().getResponse<Response>().status(statut).json({
      statusCode: statut,
      message: exception.message,
      error: exception.name,
    });
  }
}
