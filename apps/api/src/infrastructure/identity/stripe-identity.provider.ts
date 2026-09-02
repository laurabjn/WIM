import { Injectable, Logger } from '@nestjs/common';
import Stripe = require('stripe');

import type { IdentityVerificationProviderPort } from 'src/application/auth/ports/identity-verification-provider.port';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';

export function isStripeIdentityConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export type VerdictIdentite = {
  userId: string;
  sessionId: string;
  status: IdentityStatus;
};

const VERDICTS: Record<string, IdentityStatus> = {
  'identity.verification_session.verified': IdentityStatus.VERIFIED,
  'identity.verification_session.processing': IdentityStatus.IN_PROGRESS,
  'identity.verification_session.canceled': IdentityStatus.NOT_VERIFIED,
};

const REFUS_DEFINITIFS = new Set([
  'consent_declined',
  'under_supported_age',
  'country_not_supported',
]);

export function verdictApresEchec(code?: string | null): IdentityStatus {
  return REFUS_DEFINITIFS.has(code ?? '')
    ? IdentityStatus.REFUSED
    : IdentityStatus.NOT_VERIFIED;
}

@Injectable()
export class StripeIdentityProvider implements IdentityVerificationProviderPort {
  private readonly logger = new Logger(StripeIdentityProvider.name);
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_absente');
  }

  async startVerification(params: {
    userId: string;
    email: string;
  }): Promise<{ redirectUrl: string; sessionId: string }> {
    const session = await this.stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { userId: params.userId },
      provided_details: { email: params.email },
      options: {
        document: {
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
      return_url: this.urlDeRetour(),
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas renvoye d'URL de verification.");
    }

    return { redirectUrl: session.url, sessionId: session.id };
  }

  lireEvenement(corps: Buffer, signature: string): VerdictIdentite | null {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET absent.');
    }

    const evenement = this.stripe.webhooks.constructEvent(
      corps,
      signature,
      secret,
    );

    const session = evenement.data.object as Stripe.Identity.VerificationSession;

    const status =
      evenement.type === 'identity.verification_session.requires_input'
        ? this.verdictDeLEchec(session)
        : VERDICTS[evenement.type];

    if (!status) return null;

    const userId = session.metadata?.userId;

    if (!userId) {
      this.logger.warn(
        `Session ${session.id} sans userId : verdict ignore.`,
      );

      return null;
    }

    return { userId, sessionId: session.id, status };
  }

  private verdictDeLEchec(
    session: Stripe.Identity.VerificationSession,
  ): IdentityStatus {
    const code = session.last_error?.code ?? '';

    this.logger.log(
      `Verification ${session.id} interrompue : ${code || 'raison inconnue'}.`,
    );

    return verdictApresEchec(code);
  }

  private urlDeRetour(): string {
    const dediee = process.env.IDENTITY_RETURN_URL?.trim();

    if (dediee) return dediee;

    return process.env.FRONTEND_URL?.trim() || 'https://worldismine.fr';
  }
}
