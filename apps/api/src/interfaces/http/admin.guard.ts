import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Le drapeau vient du jeton, donc du serveur : il ne peut pas etre force
 * depuis l'application. A poser apres JwtAuthGuard, qui remplit `user`.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request?.user?.isAdmin !== true) {
      throw new ForbiddenException('Accès réservé à l’administration.');
    }

    return true;
  }
}
