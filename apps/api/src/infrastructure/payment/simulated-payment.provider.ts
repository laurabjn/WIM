import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type {
  PaymentProviderPort,
  PlanAbonnement,
} from 'src/application/subscription/ports/payment-provider.port';

export function isPaymentProviderConfigured(): boolean {
  return Boolean(process.env.PAYMENT_PROVIDER?.trim());
}

@Injectable()
export class SimulatedPaymentProvider implements PaymentProviderPort {
  private readonly logger = new Logger(SimulatedPaymentProvider.name);

  async creerPaiement(params: {
    userId: string;
    email: string;
    plan: PlanAbonnement;
  }): Promise<{ url: string; externalId: string }> {
    const externalId = `simule_${randomUUID()}`;

    this.logger.warn(
      `Aucun prestataire de paiement configure : l'abonnement ${params.plan} de ${params.userId} est simule (${externalId}).`,
    );

    return {
      url:
        process.env.MOCK_PAYMENT_URL?.trim() ||
        'https://example.com/paiement/simule',
      externalId,
    };
  }

  lireEvenement(): null {
    return null;
  }
}
