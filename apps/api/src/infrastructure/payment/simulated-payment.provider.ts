import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type {
  MoyenDePaiement,
  PaymentProviderPort,
  PlanAbonnement,
  TarifsParPlan,
} from 'src/application/subscription/ports/payment-provider.port';

export function isPaymentProviderConfigured(): boolean {
  return Boolean(process.env.PAYMENT_PROVIDER?.trim());
}

@Injectable()
export class SimulatedPaymentProvider implements PaymentProviderPort {
  private readonly logger = new Logger(SimulatedPaymentProvider.name);

  async tarifs(): Promise<TarifsParPlan> {
    return { MONTHLY: null, YEARLY: null };
  }

  async ouvrirLePortail(): Promise<string | null> {
    return null;
  }

  async resilier(): Promise<boolean> {
    return true;
  }

  async offrirDesJours(): Promise<Date | null> {
    return null;
  }

  async appliquerUneRemise(): Promise<boolean> {
    return false;
  }

  reconnait(): boolean {
    return false;
  }

  async effacerLeClient(): Promise<boolean> {
    return true;
  }

  async moyensDePaiement(): Promise<MoyenDePaiement[]> {
    return [];
  }

  async definirLeMoyenPrincipal(): Promise<boolean> {
    return false;
  }

  async retirerLeMoyen(): Promise<boolean> {
    return false;
  }

  async ajouterUnMoyen(): Promise<string | null> {
    return null;
  }

  async creerPaiement(params: {
    userId: string;
    email: string;
    plan: PlanAbonnement;
    devise: string;
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
