import { createPublicKey } from 'node:crypto';

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type {
  IdentiteExterne,
  SocialIdentityPort,
} from 'src/application/auth/ports/social-identity.port';

type Fournisseur = 'GOOGLE' | 'APPLE';

type Reglage = {
  jwks: string;
  emetteurs: string[];
  audiences: () => string[];
};

const DUREE_DU_CACHE_MS = 60 * 60 * 1000;

const REGLAGES: Record<Fournisseur, Reglage> = {
  GOOGLE: {
    jwks: 'https://www.googleapis.com/oauth2/v3/certs',
    emetteurs: ['https://accounts.google.com', 'accounts.google.com'],
    audiences: () => decouper(process.env.GOOGLE_CLIENT_IDS),
  },
  APPLE: {
    jwks: 'https://appleid.apple.com/auth/keys',
    emetteurs: ['https://appleid.apple.com'],
    audiences: () => decouper(process.env.APPLE_CLIENT_IDS),
  },
};

function decouper(valeur?: string): string[] {
  return (valeur ?? '')
    .split(',')
    .map((element) => element.trim())
    .filter(Boolean);
}

export function estConfigure(fournisseur: Fournisseur): boolean {
  return REGLAGES[fournisseur].audiences().length > 0;
}

type CleJwk = { kid?: string; kty?: string; [autre: string]: unknown };

@Injectable()
export class SocialIdentityVerifier implements SocialIdentityPort {
  private readonly logger = new Logger(SocialIdentityVerifier.name);

  private readonly cache = new Map<
    Fournisseur,
    { cles: CleJwk[]; obtenuA: number }
  >();

  constructor(private readonly jwt: JwtService) {}

  async verifier(
    fournisseur: Fournisseur,
    jeton: string,
  ): Promise<IdentiteExterne> {
    const reglage = REGLAGES[fournisseur];
    const audiences = reglage.audiences();

    if (audiences.length === 0) {
      throw new UnauthorizedException(
        `Connexion ${fournisseur} non configuree sur le serveur.`,
      );
    }

    const identifiantDeCle = this.lireIdentifiantDeCle(jeton);
    const cle = await this.trouverLaCle(fournisseur, identifiantDeCle);

    let charge: Record<string, unknown>;

    try {
      charge = await this.jwt.verifyAsync(jeton, {
        publicKey: createPublicKey({ key: cle as never, format: 'jwk' }).export({
          type: 'spki',
          format: 'pem',
        }) as string,
        algorithms: ['RS256'],
        issuer: reglage.emetteurs as [string, ...string[]],
        audience: audiences as [string, ...string[]],
      });
    } catch (erreur: unknown) {
      this.logger.warn(`Jeton ${fournisseur} refuse : ${erreur}`);

      throw new UnauthorizedException('Jeton de connexion invalide.');
    }

    const providerId = String(charge.sub ?? '');

    if (!providerId) {
      throw new UnauthorizedException('Jeton de connexion sans identifiant.');
    }

    return {
      providerId,
      email: typeof charge.email === 'string' ? charge.email : null,
      emailVerifie:
        charge.email_verified === true || charge.email_verified === 'true',
      firstName:
        typeof charge.given_name === 'string' ? charge.given_name : null,
      lastName:
        typeof charge.family_name === 'string' ? charge.family_name : null,
    };
  }

  private lireIdentifiantDeCle(jeton: string): string {
    const entete = jeton.split('.')[0];

    if (!entete) throw new UnauthorizedException('Jeton illisible.');

    try {
      const decode = JSON.parse(
        Buffer.from(entete, 'base64url').toString('utf8'),
      ) as { kid?: string };

      if (!decode.kid) throw new Error('kid absent');

      return decode.kid;
    } catch {
      throw new UnauthorizedException('Jeton illisible.');
    }
  }

  private async trouverLaCle(
    fournisseur: Fournisseur,
    identifiantDeCle: string,
  ): Promise<CleJwk> {
    const cles = await this.cles(fournisseur);
    const trouvee = cles.find((cle) => cle.kid === identifiantDeCle);

    if (trouvee) return trouvee;

    const fraiches = await this.cles(fournisseur, true);
    const seconde = fraiches.find((cle) => cle.kid === identifiantDeCle);

    if (!seconde) {
      throw new UnauthorizedException('Jeton signe par une cle inconnue.');
    }

    return seconde;
  }

  private async cles(
    fournisseur: Fournisseur,
    forcer = false,
  ): Promise<CleJwk[]> {
    const enCache = this.cache.get(fournisseur);

    if (
      !forcer &&
      enCache &&
      Date.now() - enCache.obtenuA < DUREE_DU_CACHE_MS
    ) {
      return enCache.cles;
    }

    const reponse = await fetch(REGLAGES[fournisseur].jwks, {
      signal: AbortSignal.timeout(8000),
    });

    if (!reponse.ok) {
      throw new UnauthorizedException(
        `Cles de signature ${fournisseur} indisponibles.`,
      );
    }

    const corps = (await reponse.json()) as { keys?: CleJwk[] };
    const cles = corps.keys ?? [];

    this.cache.set(fournisseur, { cles, obtenuA: Date.now() });

    return cles;
  }
}
