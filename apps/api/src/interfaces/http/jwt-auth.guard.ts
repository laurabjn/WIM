import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

export const SANS_VERIFICATION_IDENTITE = 'sansVerificationIdentite';

export const SansVerificationIdentite = () =>
  SetMetadata(SANS_VERIFICATION_IDENTITE, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authentifie = (await super.canActivate(context)) as boolean;

    if (!authentifie) return false;

    const exempte = this.reflector.getAllAndOverride<boolean>(
      SANS_VERIFICATION_IDENTITE,
      [context.getHandler(), context.getClass()],
    );

    if (exempte) return true;

    const requete = context.switchToHttp().getRequest();
    const identifiant = requete.user?.sub;

    if (!identifiant) return true;

    const compte = await this.prisma.user.findUnique({
      where: { id: identifiant },
      select: { isAdmin: true, identityStatus: true },
    });

    if (!compte || compte.isAdmin || compte.identityStatus === 'VERIFIED') {
      return true;
    }

    throw new ForbiddenException({
      code: 'IDENTITY_NOT_VERIFIED',
      identityStatus: compte.identityStatus,
      message:
        "Votre identite doit etre verifiee avant d'utiliser l'application.",
    });
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message ?? 'Unauthorized');
    }

    return user;
  }
}
