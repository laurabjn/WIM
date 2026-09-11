import { Injectable, Logger } from '@nestjs/common';
import Stripe = require('stripe');

import type {
  PaymentProviderPort,
  PlanAbonnement,
  TarifAffiche,
  TarifsParPlan,
  VerdictPaiement,
} from 'src/application/subscription/ports/payment-provider.port';

export function isStripePaymentConfigured(): boolean {
  return (
    process.env.PAYMENT_PROVIDER?.trim().toLowerCase() === 'stripe' &&
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(process.env.STRIPE_PRICE_YEARLY?.trim())
  );
}

const DUREE_DU_CACHE_MS = 10 * 60 * 1000;

const STATUTS_ACTIFS = new Set(['active', 'trialing']);

@Injectable()
export class StripePaymentProvider implements PaymentProviderPort {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private readonly stripe: Stripe;

  private cache: { valeur: TarifsParPlan; obtenuA: number } | null = null;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_absente');
  }

  async tarifs(): Promise<TarifsParPlan> {
    if (this.cache && Date.now() - this.cache.obtenuA < DUREE_DU_CACHE_MS) {
      return this.cache.valeur;
    }

    const [mensuel, annuel] = await Promise.all([
      this.tarif(process.env.STRIPE_PRICE_MONTHLY?.trim()),
      this.tarif(process.env.STRIPE_PRICE_YEARLY?.trim()),
    ]);

    const valeur: TarifsParPlan = { MONTHLY: mensuel, YEARLY: annuel };

    this.cache = { valeur, obtenuA: Date.now() };

    return valeur;
  }

  private async tarif(identifiant?: string): Promise<TarifAffiche | null> {
    if (!identifiant) return null;

    try {
      const tarif = await this.stripe.prices.retrieve(identifiant);

      if (tarif.unit_amount === null) return null;

      return {
        montant: tarif.unit_amount,
        devise: tarif.currency,
        libelle: new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: tarif.currency.toUpperCase(),
        }).format(tarif.unit_amount / 100),
      };
    } catch (erreur: unknown) {
      this.logger.warn(`Tarif ${identifiant} illisible : ${erreur}`);

      return null;
    }
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
    const essai = this.joursDEssai();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: tarif, quantity: 1 }],
      customer_email: params.email,
      client_reference_id: params.userId,
      metadata: { userId: params.userId, plan: params.plan },
      payment_method_collection: 'if_required',
      subscription_data: {
        metadata: { userId: params.userId, plan: params.plan },
        ...(essai > 0
          ? {
              trial_period_days: essai,
              trial_settings: {
                end_behavior: { missing_payment_method: 'cancel' },
              },
            }
          : {}),
      },
      success_url: `${retour}?abonnement=ok`,
      cancel_url: `${retour}?abonnement=annule`,
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas renvoye d'URL de paiement.");
    }

    return { url: session.url, externalId: session.id };
  }

  async ouvrirLePortail(externalId: string): Promise<string | null> {
    const client = await this.clientDe(externalId);

    if (!client) return null;

    const session = await this.stripe.billingPortal.sessions.create({
      customer: client,
      return_url: this.urlDeRetour(),
    });

    return session.url ?? null;
  }

  async resilier(externalId: string): Promise<boolean> {
    const abonnement = await this.abonnementDe(externalId);

    if (!abonnement) return false;

    try {
      await this.stripe.subscriptions.update(abonnement, {
        cancel_at_period_end: true,
      });

      this.logger.log(
        `Abonnement ${abonnement} resilie a la fin de la periode.`,
      );

      return true;
    } catch (erreur: unknown) {
      this.logger.warn(`Resiliation refusee pour ${abonnement} : ${erreur}`);

      return false;
    }
  }

  private async abonnementDe(externalId: string): Promise<string | null> {
    if (externalId.startsWith('sub_')) return externalId;

    try {
      const session = await this.stripe.checkout.sessions.retrieve(externalId);

      const abonnement = session.subscription;

      return typeof abonnement === 'string'
        ? abonnement
        : (abonnement?.id ?? null);
    } catch (erreur: unknown) {
      this.logger.warn(`Abonnement introuvable pour ${externalId} : ${erreur}`);

      return null;
    }
  }

  private async clientDe(externalId: string): Promise<string | null> {
    try {
      const objet = externalId.startsWith('cs_')
        ? await this.stripe.checkout.sessions.retrieve(externalId)
        : await this.stripe.subscriptions.retrieve(externalId);

      const client = objet.customer;

      return typeof client === 'string' ? client : (client?.id ?? null);
    } catch (erreur: unknown) {
      this.logger.warn(`Client introuvable pour ${externalId} : ${erreur}`);

      return null;
    }
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
    const statut = !STATUTS_ACTIFS.has(abonnement.status)
      ? 'EXPIRED'
      : abonnement.cancel_at_period_end
        ? 'CANCELLED'
        : 'ACTIVE';

    this.logger.log(
      `Abonnement ${abonnement.id} : ${abonnement.status} -> ${statut}.`,
    );

    return {
      externalId: abonnement.id,
      statut,
      finDePeriode: this.finDePeriode(abonnement),
    };
  }

  private finDePeriode(abonnement: Stripe.Subscription): Date | null {
    const secondes = abonnement.items?.data?.[0]?.current_period_end;

    return typeof secondes === 'number' ? new Date(secondes * 1000) : null;
  }

  private joursDEssai(): number {
    const declare = Number.parseInt(
      process.env.STRIPE_TRIAL_DAYS?.trim() ?? '',
      10,
    );

    return Number.isFinite(declare) && declare > 0 ? declare : 0;
  }

  private urlDeRetour(): string {
    return (
      process.env.SUBSCRIPTION_RETURN_URL?.trim() ||
      process.env.FRONTEND_URL?.trim() ||
      'https://worldismine.fr'
    );
  }
}
