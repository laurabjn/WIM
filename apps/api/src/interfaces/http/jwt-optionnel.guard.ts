import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionnelGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // Laisser passer : la route sert aussi les visiteurs.
    }

    return true;
  }

  handleRequest<T>(_erreur: unknown, utilisateur: T): T | null {
    return utilisateur || null;
  }
}
