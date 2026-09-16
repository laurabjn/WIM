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

export const IDENTITE_VERIFIEE = 'identiteVerifiee';

export const IdentiteVerifiee = () => SetMetadata(IDENTITE_VERIFIEE, true);

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

    const exigee = this.reflector.getAllAndOverride<boolean>(
      IDENTITE_VERIFIEE,
      [context.getHandler(), context.getClass()],
    );

    if (!exigee) return true;

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
        'Votre identité doit être vérifiée pour publier un logement ou demander un échange.',
    });
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message ?? 'Unauthorized');
    }

    return user;
  }
}
