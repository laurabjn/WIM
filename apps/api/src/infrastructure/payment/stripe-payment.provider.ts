import { Injectable, Logger } from '@nestjs/common';
import Stripe = require('stripe');

import type {
  PaymentProviderPort,
  PlanAbonnement,
  VerdictPaiement,
} from 'src/application/subscription/ports/payment-provider.port';

export function isStripePaymentConfigured(): boolean {
  return (
    process.env.PAYMENT_PROVIDER?.trim().toLowerCase() === 'stripe' &&
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(process.env.STRIPE_PRICE_MONTHLY?.trim()) &&
    Boolean(process.env.STRIPE_PRICE_YEARLY?.trim())
  );
}

const STATUTS_ACTIFS = new Set(['active', 'trialing']);
const STATUTS_TERMINES = new Set(['canceled', 'incomplete_expired']);

@Injectable()
export class StripePaymentProvider implements PaymentProviderPort {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_absente');
  }

  async creerPaiement(params: {
    userId: string;
    email: string;
    plan: PlanAbonnement;
  }): Promise<{ url: string; externalId: string }> {
    const tarif =
      params.plan === 'YEARLY'
        ? process.env.STRIPE_PRICE_YEARLY?.trim()
        : process.env.STRIPE_PRICE_MONTHLY?.trim();

    if (!tarif) {
      throw new Error(`Aucun tarif Stripe pour le plan ${params.plan}.`);
    }

    const retour = this.urlDeRetour();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: tarif, quantity: 1 }],
      customer_email: params.email,
      client_reference_id: params.userId,
      metadata: { userId: params.userId, plan: params.plan },
      subscription_data: {
        metadata: { userId: params.userId, plan: params.plan },
      },
      success_url: `${retour}?abonnement=ok`,
      cancel_url: `${retour}?abonnement=annule`,
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas renvoye d'URL de paiement.");
    }

    return { url: session.url, externalId: session.id };
  }

  lireEvenement(corps: Buffer, signature: string): VerdictPaiement | null {
    const secret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET?.trim();

    if (!secret) {
      throw new Error('STRIPE_SUBSCRIPTION_WEBHOOK_SECRET absent.');
    }

    const evenement = this.stripe.webhooks.constructEvent(
      corps,
      signature,
      secret,
    );

    if (evenement.type === 'checkout.session.completed') {
      return this.verdictDeLaCaisse(
        evenement.data.object as Stripe.Checkout.Session,
      );
    }

    if (
      evenement.type === 'customer.subscription.updated' ||
      evenement.type === 'customer.subscription.deleted'
    ) {
      return this.verdictDeLAbonnement(
        evenement.data.object as Stripe.Subscription,
      );
    }

    return null;
  }

  private verdictDeLaCaisse(
    session: Stripe.Checkout.Session,
  ): VerdictPaiement | null {
    if (session.payment_status === 'unpaid') return null;

    const abonnement =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    this.logger.log(
      `Paiement encaisse pour la session ${session.id}${
        abonnement ? `, abonnement ${abonnement}` : ''
      }.`,
    );

    return {
      externalId: session.id,
      nouvelExternalId: abonnement ?? undefined,
      statut: 'ACTIVE',
      finDePeriode: null,
    };
  }

  private verdictDeLAbonnement(
    abonnement: Stripe.Subscription,
  ): VerdictPaiement {
    const statut = STATUTS_ACTIFS.has(abonnement.status)
      ? 'ACTIVE'
      : STATUTS_TERMINES.has(abonnement.status)
        ? 'EXPIRED'
        : 'CANCELLED';

    const fin = this.finDePeriode(abonnement);

    this.logger.log(
      `Abonnement ${abonnement.id} : ${abonnement.status} -> ${statut}.`,
    );

    return {
      externalId: abonnement.id,
      statut:
        statut === 'ACTIVE' && abonnement.cancel_at_period_end
          ? 'CANCELLED'
          : statut,
      finDePeriode: fin,
    };
  }

  private finDePeriode(abonnement: Stripe.Subscription): Date | null {
    const secondes = abonnement.items?.data?.[0]?.current_period_end;

    return typeof secondes === 'number' ? new Date(secondes * 1000) : null;
  }

  private urlDeRetour(): string {
    return (
      process.env.SUBSCRIPTION_RETURN_URL?.trim() ||
      process.env.FRONTEND_URL?.trim() ||
      'https://worldismine.fr'
    );
  }
}
