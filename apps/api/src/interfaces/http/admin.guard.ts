import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

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
