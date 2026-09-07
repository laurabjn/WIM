import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { SOCIAL_IDENTITY } from 'src/interfaces/http/tokens/token';
import type { SocialIdentityPort } from '../ports/social-identity.port';

const REFUS_ADMINISTRATION =
  "Les comptes d'administration se connectent avec leur mot de passe.";

export type SignInWithProviderInput = {
  provider: 'GOOGLE' | 'APPLE';
  idToken: string;
  firstName?: string | null;
  lastName?: string | null;
};

@Injectable()
export class SignInWithProviderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SOCIAL_IDENTITY)
    private readonly identites: SocialIdentityPort,
  ) {}

  async execute(input: SignInWithProviderInput) {
    const identite = await this.identites.verifier(
      input.provider,
      input.idToken,
    );

    const existante = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerId: {
          provider: input.provider,
          providerId: identite.providerId,
        },
      },
      select: { userId: true },
    });

    if (existante) {
      return this.rendre(existante.userId);
    }

    const email = identite.email?.trim().toLowerCase() ?? null;

    if (!email || !identite.emailVerifie) {
      throw new UnauthorizedException(
        "Ce compte ne fournit pas d'adresse e-mail verifiee.",
      );
    }

    const parEmail = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, isAdmin: true },
    });

    if (parEmail?.isAdmin) {
      throw new ForbiddenException(REFUS_ADMINISTRATION);
    }

    const userId = parEmail
      ? parEmail.id
      : (
          await this.prisma.user.create({
            data: {
              email,
              firstName: input.firstName ?? identite.firstName,
              lastName: input.lastName ?? identite.lastName,
            },
            select: { id: true },
          })
        ).id;

    await this.prisma.authIdentity.create({
      data: {
        provider: input.provider,
        providerId: identite.providerId,
        userId,
      },
    });

    return this.rendre(userId);
  }

  private async rendre(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        identityStatus: true,
        isAdmin: true,
        suspendedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Compte introuvable.');
    }

    if (user.isAdmin) {
      throw new ForbiddenException(REFUS_ADMINISTRATION);
    }

    if (user.suspendedAt) {
      throw new ForbiddenException(
        'Ce compte a été suspendu. Contactez le support.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      identityStatus: user.identityStatus,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
