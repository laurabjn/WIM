import { StripePaymentProvider } from 'src/infrastructure/payment/stripe-payment.provider';

type Evenement = { type: string; data: { object: unknown } };

function fournisseurAvec(evenement: Evenement) {
  const provider = new StripePaymentProvider();

  (provider as unknown as { stripe: unknown }).stripe = {
    webhooks: { constructEvent: () => evenement },
  };

  return provider;
}

describe('StripePaymentProvider.lireEvenement', () => {
  const corps = Buffer.from('{}');

  beforeEach(() => {
    process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET = 'whsec_essai';
  });

  it('active l abonnement et retient l identifiant durable a l encaissement', () => {
    const provider = fournisseurAvec({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          payment_status: 'paid',
          subscription: 'sub_456',
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')).toEqual({
      externalId: 'cs_123',
      nouvelExternalId: 'sub_456',
      statut: 'ACTIVE',
      finDePeriode: null,
    });
  });

  it('ignore une caisse restee impayee', () => {
    const provider = fournisseurAvec({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_123', payment_status: 'unpaid' } },
    });

    expect(provider.lireEvenement(corps, 'signature')).toBeNull();
  });

  it('lit la fin de periode d un abonnement actif', () => {
    const fin = Math.floor(Date.now() / 1000) + 3600;

    const provider = fournisseurAvec({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_456',
          status: 'active',
          cancel_at_period_end: false,
          items: { data: [{ current_period_end: fin }] },
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')).toEqual({
      externalId: 'sub_456',
      statut: 'ACTIVE',
      finDePeriode: new Date(fin * 1000),
    });
  });

  it('compte comme resilie un abonnement actif mais non reconduit', () => {
    const provider = fournisseurAvec({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_456',
          status: 'active',
          cancel_at_period_end: true,
          items: { data: [] },
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')?.statut).toBe('CANCELLED');
  });

  it('compte comme expire un abonnement annule par Stripe', () => {
    const provider = fournisseurAvec({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_456',
          status: 'canceled',
          cancel_at_period_end: false,
          items: { data: [] },
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')?.statut).toBe('EXPIRED');
  });

  it('ignore les evenements dont nous n avons que faire', () => {
    const provider = fournisseurAvec({
      type: 'invoice.created',
      data: { object: {} },
    });

    expect(provider.lireEvenement(corps, 'signature')).toBeNull();
  });

  it('refuse de lire sans secret de signature', () => {
    delete process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;

    const provider = fournisseurAvec({
      type: 'invoice.created',
      data: { object: {} },
    });

    expect(() => provider.lireEvenement(corps, 'signature')).toThrow(
      'STRIPE_SUBSCRIPTION_WEBHOOK_SECRET absent',
    );
  });
});

describe('StripePaymentProvider.creerPaiement', () => {
  function fournisseurAvecCaisse() {
    const provider = new StripePaymentProvider();
    const creer = jest.fn().mockResolvedValue({
      id: 'cs_123',
      url: 'https://checkout.stripe.com/abc',
    });

    (provider as unknown as { stripe: unknown }).stripe = {
      checkout: { sessions: { create: creer } },
    };

    return { provider, creer };
  }

  beforeEach(() => {
    process.env.STRIPE_PRICE_YEARLY = 'price_annuel';
    delete process.env.STRIPE_TRIAL_DAYS;
  });

  it('ouvre une caisse sur le tarif annuel', async () => {
    const { provider, creer } = fournisseurAvecCaisse();

    await expect(
      provider.creerPaiement({
        userId: 'u1',
        email: 'lea@exemple.fr',
        plan: 'YEARLY',
      }),
    ).resolves.toEqual({
      url: 'https://checkout.stripe.com/abc',
      externalId: 'cs_123',
    });

    const parametres = creer.mock.calls[0][0];

    expect(parametres.mode).toBe('subscription');
    expect(parametres.line_items[0].price).toBe('price_annuel');
    expect(parametres.client_reference_id).toBe('u1');
  });

  it("n'exige pas de carte pendant l'essai", async () => {
    const { provider, creer } = fournisseurAvecCaisse();

    await provider.creerPaiement({
      userId: 'u1',
      email: 'lea@exemple.fr',
      plan: 'YEARLY',
    });

    expect(creer.mock.calls[0][0].payment_method_collection).toBe('if_required');
  });

  it("offre la premiere annee quand un essai est declare", async () => {
    process.env.STRIPE_TRIAL_DAYS = '365';

    const { provider, creer } = fournisseurAvecCaisse();

    await provider.creerPaiement({
      userId: 'u1',
      email: 'lea@exemple.fr',
      plan: 'YEARLY',
    });

    expect(creer.mock.calls[0][0].subscription_data.trial_period_days).toBe(365);
  });

  it("n'annonce aucun essai quand rien n'est declare", async () => {
    const { provider, creer } = fournisseurAvecCaisse();

    await provider.creerPaiement({
      userId: 'u1',
      email: 'lea@exemple.fr',
      plan: 'YEARLY',
    });

    expect(
      creer.mock.calls[0][0].subscription_data.trial_period_days,
    ).toBeUndefined();
  });

  it('refuse un plan dont le tarif n est pas configure', async () => {
    delete process.env.STRIPE_PRICE_MONTHLY;

    const { provider } = fournisseurAvecCaisse();

    await expect(
      provider.creerPaiement({
        userId: 'u1',
        email: 'lea@exemple.fr',
        plan: 'MONTHLY',
      }),
    ).rejects.toThrow('Aucun tarif Stripe');
  });
});
