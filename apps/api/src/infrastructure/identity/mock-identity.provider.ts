import { Injectable, Logger } from '@nestjs/common';

import type { IdentityVerificationProviderPort } from 'src/application/auth/ports/identity-verification-provider.port';

@Injectable()
export class MockIdentityProvider implements IdentityVerificationProviderPort {
  private readonly logger = new Logger(MockIdentityProvider.name);

  async startVerification(params: {
    userId: string;
    email: string;
  }): Promise<{
    redirectUrl: string;
    returnUrl: string;
    sessionId: string;
  }> {
    const sessionId = `mock_${params.userId.slice(0, 8)}`;

    this.logger.warn(
      `STRIPE_SECRET_KEY absente : aucune verification reelle. La session ${sessionId} est simulee et POST /api/identity/simulate permet de la conclure.`,
    );

    return {
      redirectUrl:
        process.env.MOCK_IDENTITY_VERIFICATION_URL?.trim() ||
        'https://example.com/identity/mock',
      returnUrl:
        process.env.IDENTITY_RETURN_URL?.trim() ||
        process.env.FRONTEND_URL?.trim() ||
        'https://worldismine.fr',
      sessionId,
    };
  }
}
