import { Injectable, Logger } from '@nestjs/common';
import Stripe = require('stripe');

import type {
  Devise,
  MoyenDePaiement,
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

const LOCALE_PAR_DEVISE: Record<Devise, string> = { EUR: 'fr-FR', USD: 'en-US' };

function identifiantDuTarif(plan: PlanAbonnement, devise: Devise): string | undefined {
  const base = plan === 'YEARLY' ? 'STRIPE_PRICE_YEARLY' : 'STRIPE_PRICE_MONTHLY';
  const localise = devise === 'EUR' ? undefined : process.env[`${base}_${devise}`]?.trim();

  return localise || process.env[base]?.trim();
}

const STATUTS_ACTIFS = new Set(['active', 'trialing']);
const JOUR_S = 24 * 60 * 60;

const LIBELLES: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  cartes_bancaires: 'Carte bancaire',
  sepa_debit: 'Prélèvement SEPA',
  paypal: 'PayPal',
};

function libelleDe(cle: string): string {
  return LIBELLES[cle] ?? cle.charAt(0).toUpperCase() + cle.slice(1);
}

@Injectable()
export class StripePaymentProvider implements PaymentProviderPort {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private readonly stripe: Stripe;

  private cache = new Map<Devise, { valeur: TarifsParPlan; obtenuA: number }>();

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_absente');
  }

  async tarifs(devise: Devise): Promise<TarifsParPlan> {
    const connu = this.cache.get(devise);

    if (connu && Date.now() - connu.obtenuA < DUREE_DU_CACHE_MS) {
      return connu.valeur;
    }

    const [mensuel, annuel] = await Promise.all([
      this.tarif(identifiantDuTarif('MONTHLY', devise), devise),
      this.tarif(identifiantDuTarif('YEARLY', devise), devise),
    ]);

    const valeur: TarifsParPlan = { MONTHLY: mensuel, YEARLY: annuel };

    this.cache.set(devise, { valeur, obtenuA: Date.now() });

    return valeur;
  }

  private async tarif(
    identifiant: string | undefined,
    devise: Devise,
  ): Promise<TarifAffiche | null> {
    if (!identifiant) return null;

    try {
      const tarif = await this.stripe.prices.retrieve(identifiant);

      if (tarif.unit_amount === null) return null;

      return {
        montant: tarif.unit_amount,
        devise: tarif.currency,
        libelle: new Intl.NumberFormat(LOCALE_PAR_DEVISE[devise], {
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
    devise: Devise;
    coupon?: string;
    client?: string | null;
  }): Promise<{ url: string; externalId: string }> {
    const tarif = identifiantDuTarif(params.plan, params.devise);

    if (!tarif) {
      throw new Error(`Aucun tarif Stripe pour le plan ${params.plan}.`);
    }

    const retour = this.urlDeRetour();
    const essai = this.joursDEssai();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: tarif, quantity: 1 }],
      ...(params.client
        ? { customer: params.client }
        : { customer_email: params.email }),
      client_reference_id: params.userId,
      metadata: { userId: params.userId, plan: params.plan },
      payment_method_collection: 'if_required',
      ...(params.coupon ? { discounts: [{ coupon: params.coupon }] } : {}),
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

  reconnait(externalId: string): boolean {
    return externalId.startsWith('cs_') || externalId.startsWith('sub_');
  }

  async effacerLeClient(externalId: string): Promise<boolean> {
    const client = await this.clientDe(externalId);

    if (!client) return false;

    try {
      await this.stripe.customers.del(client);

      this.logger.log(`Client ${client} efface, abonnements annules.`);

      return true;
    } catch (erreur: unknown) {
      this.logger.warn(`Effacement refuse pour ${client} : ${erreur}`);

      return false;
    }
  }

  async appliquerUneRemise(externalId: string, coupon: string): Promise<boolean> {
    const abonnement = await this.abonnementDe(externalId);

    if (!abonnement) return false;

    try {
      await this.stripe.subscriptions.update(abonnement, {
        discounts: [{ coupon }],
      });

      this.logger.log(`Remise ${coupon} appliquee a ${abonnement}.`);

      return true;
    } catch (erreur: unknown) {
      this.logger.warn(`Remise refusee pour ${abonnement} : ${erreur}`);

      return false;
    }
  }

  async offrirDesJours(externalId: string, jours: number): Promise<Date | null> {
    const abonnement = await this.abonnementDe(externalId);

    if (!abonnement) return null;

    try {
      const detail = await this.stripe.subscriptions.retrieve(abonnement);
      const finActuelle = detail.items?.data?.[0]?.current_period_end ?? 0;
      const maintenant = Math.floor(Date.now() / 1000);
      const nouvelleFin = Math.max(finActuelle, maintenant) + jours * JOUR_S;

      await this.stripe.subscriptions.update(abonnement, {
        trial_end: nouvelleFin,
        proration_behavior: 'none',
      });

      this.logger.log(
        `Abonnement ${abonnement} prolonge de ${jours} jours jusqu'au ${new Date(nouvelleFin * 1000).toISOString()}.`,
      );

      return new Date(nouvelleFin * 1000);
    } catch (erreur: unknown) {
      this.logger.warn(`Prolongation refusee pour ${abonnement} : ${erreur}`);

      return null;
    }
  }

  async clientDeLAbonnement(externalId: string): Promise<string | null> {
    return this.clientDe(externalId);
  }

  async creerUnClient(params: {
    userId: string;
    email: string;
  }): Promise<string | null> {
    try {
      const client = await this.stripe.customers.create({
        email: params.email,
        metadata: { userId: params.userId },
      });

      return client.id;
    } catch (erreur: unknown) {
      this.logger.warn(
        `Client de paiement non cree pour ${params.userId} : ${erreur}`,
      );

      return null;
    }
  }

  async moyensDePaiement(client: string): Promise<MoyenDePaiement[]> {
    const [moyens, principal] = await Promise.all([
      this.stripe.paymentMethods.list({ customer: client, limit: 20 }),
      this.moyenPrincipalDe(client),
    ]);

    if (moyens.data.length === 0) return [];

    const principalEffectif = principal ?? moyens.data[0].id;

    if (!principal) {
      await this.definirLeMoyenPrincipal(client, principalEffectif);
    }

    return moyens.data.map((moyen) => this.decrire(moyen, principalEffectif));
  }

  async definirLeMoyenPrincipal(
    client: string,
    moyenId: string,
  ): Promise<boolean> {
    if (!(await this.appartientA(moyenId, client))) return false;

    await this.stripe.customers.update(client, {
      invoice_settings: { default_payment_method: moyenId },
    });

    const abonnement = await this.abonnementDuClient(client);

    if (abonnement) {
      await this.stripe.subscriptions.update(abonnement, {
        default_payment_method: moyenId,
      });
    }

    return true;
  }

  async retirerLeMoyen(client: string, moyenId: string): Promise<boolean> {
    if (!(await this.appartientA(moyenId, client))) return false;

    await this.stripe.paymentMethods.detach(moyenId);

    return true;
  }

  async ajouterUnMoyen(client: string): Promise<string | null> {
    const retour = this.urlDeRetour();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'setup',
      customer: client,
      success_url: `${retour}?moyen=ok`,
      cancel_url: `${retour}?moyen=annule`,
    });

    return session.url ?? null;
  }

  private async abonnementDuClient(client: string): Promise<string | null> {
    try {
      const abonnements = await this.stripe.subscriptions.list({
        customer: client,
        status: 'active',
        limit: 1,
      });

      return abonnements.data[0]?.id ?? null;
    } catch (erreur: unknown) {
      this.logger.warn(`Abonnements illisibles pour ${client} : ${erreur}`);

      return null;
    }
  }

  private async moyenPrincipalDe(client: string): Promise<string | null> {
    const abonnement = await this.abonnementDuClient(client);

    if (abonnement) {
      const detail = await this.stripe.subscriptions.retrieve(abonnement);
      const moyen = detail.default_payment_method;

      if (moyen) return typeof moyen === 'string' ? moyen : moyen.id;
    }

    const detailClient = await this.stripe.customers.retrieve(client);

    if ('deleted' in detailClient && detailClient.deleted) return null;

    const moyen = (detailClient as Stripe.Customer).invoice_settings
      ?.default_payment_method;

    return typeof moyen === 'string' ? moyen : (moyen?.id ?? null);
  }

  private async appartientA(moyenId: string, client: string): Promise<boolean> {
    try {
      const moyen = await this.stripe.paymentMethods.retrieve(moyenId);
      const proprietaire = moyen.customer;

      return (
        (typeof proprietaire === 'string' ? proprietaire : proprietaire?.id) ===
        client
      );
    } catch (erreur: unknown) {
      this.logger.warn(`Moyen de paiement ${moyenId} illisible : ${erreur}`);

      return false;
    }
  }

  private decrire(
    moyen: Stripe.PaymentMethod,
    principal: string,
  ): MoyenDePaiement {
    const detail =
      moyen.card?.last4 ??
      moyen.sepa_debit?.last4 ??
      moyen.paypal?.payer_email ??
      '';

    const libelle = moyen.card
      ? libelleDe(moyen.card.brand)
      : libelleDe(moyen.type);

    return {
      id: moyen.id,
      type: moyen.type,
      libelle,
      detail,
      principal: moyen.id === principal,
    };
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

    if (evenement.type === 'invoice.paid') {
      return this.verdictDeLaFacture(evenement.data.object as Stripe.Invoice);
    }

    return null;
  }

  private verdictDeLaFacture(facture: Stripe.Invoice): VerdictPaiement | null {
    if (facture.amount_paid <= 0) return null;

    const abonnement = facture.parent?.subscription_details?.subscription;

    if (!abonnement) return null;

    const fin = facture.lines?.data?.[0]?.period?.end;

    this.logger.log(
      `Facture ${facture.id} reglee : ${facture.amount_paid} ${facture.currency}.`,
    );

    return {
      externalId: typeof abonnement === 'string' ? abonnement : abonnement.id,
      statut: 'ACTIVE',
      finDePeriode: typeof fin === 'number' ? new Date(fin * 1000) : null,
    };
  }

  private verdictDeLaCaisse(
    session: Stripe.Checkout.Session,
  ): VerdictPaiement | null {
    if (session.mode === 'setup') return null;

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
