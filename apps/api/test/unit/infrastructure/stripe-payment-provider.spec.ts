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

  it('ignore une caisse ouverte pour enregistrer un moyen de paiement', () => {
    const provider = fournisseurAvec({
      type: 'checkout.session.completed',
      data: {
        object: { id: 'cs_setup', mode: 'setup', payment_status: 'no_payment_required' },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')).toBeNull();
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

  it('ferme l acces des qu une echeance reste impayee', () => {
    const fin = Math.floor(Date.now() / 1000) + 3600;

    const provider = fournisseurAvec({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_456',
          status: 'past_due',
          cancel_at_period_end: false,
          items: { data: [{ current_period_end: fin }] },
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')?.statut).toBe('EXPIRED');
  });

  it('ferme l acces d un abonnement mis en pause', () => {
    const provider = fournisseurAvec({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_456',
          status: 'paused',
          cancel_at_period_end: false,
          items: { data: [] },
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')?.statut).toBe('EXPIRED');
  });

  it('signale un paiement reel a la facture reglee', () => {
    const fin = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;

    const provider = fournisseurAvec({
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_1',
          amount_paid: 2500,
          currency: 'eur',
          parent: { subscription_details: { subscription: 'sub_456' } },
          lines: { data: [{ period: { end: fin } }] },
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')).toEqual({
      externalId: 'sub_456',
      statut: 'ACTIVE',
      finDePeriode: new Date(fin * 1000),
    });
  });

  it('ne compte pas une facture a zero comme un paiement', () => {
    const provider = fournisseurAvec({
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_0',
          amount_paid: 0,
          currency: 'eur',
          parent: { subscription_details: { subscription: 'sub_456' } },
          lines: { data: [] },
        },
      },
    });

    expect(provider.lireEvenement(corps, 'signature')).toBeNull();
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
        devise: 'EUR',
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
      devise: 'EUR',
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
      devise: 'EUR',
    });

    expect(creer.mock.calls[0][0].subscription_data.trial_period_days).toBe(365);
  });

  it("annule net a la fin de l'essai si aucune carte n'a ete ajoutee", async () => {
    process.env.STRIPE_TRIAL_DAYS = '365';

    const { provider, creer } = fournisseurAvecCaisse();

    await provider.creerPaiement({
      userId: 'u1',
      email: 'lea@exemple.fr',
      plan: 'YEARLY',
      devise: 'EUR',
    });

    expect(
      creer.mock.calls[0][0].subscription_data.trial_settings.end_behavior
        .missing_payment_method,
    ).toBe('cancel');
  });

  it("n'annonce aucun essai quand rien n'est declare", async () => {
    const { provider, creer } = fournisseurAvecCaisse();

    await provider.creerPaiement({
      userId: 'u1',
      email: 'lea@exemple.fr',
      plan: 'YEARLY',
      devise: 'EUR',
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
        devise: 'EUR',
      }),
    ).rejects.toThrow('Aucun tarif Stripe');
  });
});

describe('StripePaymentProvider.resilier', () => {
  function fournisseurAvecAbonnements(caisse?: { subscription?: string }) {
    const provider = new StripePaymentProvider();
    const modifier = jest.fn().mockResolvedValue({});
    const lireLaCaisse = caisse
      ? jest.fn().mockResolvedValue(caisse)
      : jest.fn().mockRejectedValue(new Error('introuvable'));

    (provider as unknown as { stripe: unknown }).stripe = {
      subscriptions: { update: modifier },
      checkout: { sessions: { retrieve: lireLaCaisse } },
    };

    return { provider, modifier, lireLaCaisse };
  }

  it('coupe la reconduction a la fin de la periode deja reglee', async () => {
    const { provider, modifier } = fournisseurAvecAbonnements();

    await expect(provider.resilier('sub_456')).resolves.toBe(true);

    expect(modifier).toHaveBeenCalledWith('sub_456', {
      cancel_at_period_end: true,
    });
  });

  it('retrouve l abonnement quand seule la caisse est connue', async () => {
    const { provider, modifier, lireLaCaisse } = fournisseurAvecAbonnements({
      subscription: 'sub_456',
    });

    await expect(provider.resilier('cs_123')).resolves.toBe(true);

    expect(lireLaCaisse).toHaveBeenCalledWith('cs_123');
    expect(modifier).toHaveBeenCalledWith('sub_456', {
      cancel_at_period_end: true,
    });
  });

  it('renonce quand la caisse n a jamais donne d abonnement', async () => {
    const { provider, modifier } = fournisseurAvecAbonnements({});

    await expect(provider.resilier('cs_123')).resolves.toBe(false);

    expect(modifier).not.toHaveBeenCalled();
  });

  it('signale l echec plutot que de laisser croire a une resiliation', async () => {
    const { provider } = fournisseurAvecAbonnements();

    (provider as unknown as { stripe: { subscriptions: { update: jest.Mock } } })
      .stripe.subscriptions.update.mockRejectedValue(new Error('refus'));

    await expect(provider.resilier('sub_456')).resolves.toBe(false);
  });
});

describe('StripePaymentProvider.moyensDePaiement', () => {
  const carte = {
    id: 'pm_carte',
    type: 'card',
    customer: 'cus_1',
    card: { brand: 'mastercard', last4: '6789' },
  };
  const paypal = {
    id: 'pm_paypal',
    type: 'paypal',
    customer: 'cus_1',
    paypal: { payer_email: 'lea@exemple.fr' },
  };

  function fournisseurAvecClient(options: {
    moyens: unknown[];
    principalAbonnement?: string | null;
    principalClient?: string | null;
  }) {
    const provider = new StripePaymentProvider();
    const modifierClient = jest.fn().mockResolvedValue({});
    const modifierAbonnement = jest.fn().mockResolvedValue({});
    const detacher = jest.fn().mockResolvedValue({});

    (provider as unknown as { stripe: unknown }).stripe = {
      subscriptions: {
        retrieve: jest.fn().mockResolvedValue({
          customer: 'cus_1',
          default_payment_method: options.principalAbonnement ?? null,
        }),
        update: modifierAbonnement,
        list: jest.fn().mockResolvedValue({ data: [{ id: 'sub_1' }] }),
      },
      customers: {
        retrieve: jest.fn().mockResolvedValue({
          id: 'cus_1',
          invoice_settings: {
            default_payment_method: options.principalClient ?? null,
          },
        }),
        update: modifierClient,
      },
      paymentMethods: {
        list: jest.fn().mockResolvedValue({ data: options.moyens }),
        retrieve: jest.fn().mockImplementation((id: string) =>
          Promise.resolve(
            options.moyens.find((m) => (m as { id: string }).id === id) ?? {
              id,
              customer: 'cus_autre',
            },
          ),
        ),
        detach: detacher,
      },
    };

    return { provider, modifierClient, modifierAbonnement, detacher };
  }

  it('decrit chaque moyen avec sa marque et sa fin', async () => {
    const { provider } = fournisseurAvecClient({
      moyens: [carte, paypal],
      principalAbonnement: 'pm_paypal',
    });

    await expect(provider.moyensDePaiement('cus_1')).resolves.toEqual([
      { id: 'pm_carte', type: 'card', libelle: 'Mastercard', detail: '6789', principal: false },
      { id: 'pm_paypal', type: 'paypal', libelle: 'PayPal', detail: 'lea@exemple.fr', principal: true },
    ]);
  });

  it('promeut le premier moyen quand aucun n est principal', async () => {
    const { provider, modifierClient, modifierAbonnement } = fournisseurAvecClient({
      moyens: [carte, paypal],
    });

    const moyens = await provider.moyensDePaiement('cus_1');

    expect(moyens[0].principal).toBe(true);
    expect(modifierClient).toHaveBeenCalledWith('cus_1', {
      invoice_settings: { default_payment_method: 'pm_carte' },
    });
    expect(modifierAbonnement).toHaveBeenCalledWith('sub_1', {
      default_payment_method: 'pm_carte',
    });
  });

  it('refuse de toucher au moyen d un autre client', async () => {
    const { provider, detacher, modifierClient } = fournisseurAvecClient({
      moyens: [carte],
      principalClient: 'pm_carte',
    });

    await expect(provider.retirerLeMoyen('cus_1', 'pm_etranger')).resolves.toBe(false);
    await expect(provider.definirLeMoyenPrincipal('cus_1', 'pm_etranger')).resolves.toBe(false);

    expect(detacher).not.toHaveBeenCalled();
    expect(modifierClient).not.toHaveBeenCalled();
  });

  it('detache un moyen qui appartient bien au client', async () => {
    const { provider, detacher } = fournisseurAvecClient({
      moyens: [carte, paypal],
      principalClient: 'pm_carte',
    });

    await expect(provider.retirerLeMoyen('cus_1', 'pm_paypal')).resolves.toBe(true);

    expect(detacher).toHaveBeenCalledWith('pm_paypal');
  });
});

describe('StripePaymentProvider.offrirDesJours', () => {
  function fournisseurProlongeable(finActuelle: number) {
    const provider = new StripePaymentProvider();
    const modifier = jest.fn().mockResolvedValue({});

    (provider as unknown as { stripe: unknown }).stripe = {
      subscriptions: {
        retrieve: jest.fn().mockResolvedValue({
          items: { data: [{ current_period_end: finActuelle }] },
        }),
        update: modifier,
      },
    };

    return { provider, modifier };
  }

  it('repousse la prochaine echeance de trente jours sans rien facturer', async () => {
    const fin = Math.floor(Date.now() / 1000) + 100 * 24 * 3600;
    const { provider, modifier } = fournisseurProlongeable(fin);

    const nouvelleFin = await provider.offrirDesJours('sub_456', 30);

    expect(nouvelleFin).toEqual(new Date((fin + 30 * 24 * 3600) * 1000));
    expect(modifier).toHaveBeenCalledWith('sub_456', {
      trial_end: fin + 30 * 24 * 3600,
      proration_behavior: 'none',
    });
  });

  it('part d aujourd hui quand la periode est deja passee', async () => {
    const passee = Math.floor(Date.now() / 1000) - 100 * 24 * 3600;
    const { provider } = fournisseurProlongeable(passee);

    const nouvelleFin = await provider.offrirDesJours('sub_456', 30);

    expect(nouvelleFin!.getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 3600 * 1000);
  });
});

describe('StripePaymentProvider et les devises', () => {
  const sauvegarde = {
    eur: process.env.STRIPE_PRICE_YEARLY,
    usd: process.env.STRIPE_PRICE_YEARLY_USD,
  };

  afterEach(() => {
    process.env.STRIPE_PRICE_YEARLY = sauvegarde.eur;
    if (sauvegarde.usd === undefined) delete process.env.STRIPE_PRICE_YEARLY_USD;
    else process.env.STRIPE_PRICE_YEARLY_USD = sauvegarde.usd;
  });

  function fournisseurAvecCaisse() {
    const provider = new StripePaymentProvider();
    const creer = jest.fn().mockResolvedValue({ id: 'cs_1', url: 'https://caisse' });

    (provider as unknown as { stripe: unknown }).stripe = {
      checkout: { sessions: { create: creer } },
    };

    return { provider, creer };
  }

  it('ouvre la caisse sur le tarif en dollars pour qui a choisi USD', async () => {
    process.env.STRIPE_PRICE_YEARLY = 'price_eur';
    process.env.STRIPE_PRICE_YEARLY_USD = 'price_usd';

    const { provider, creer } = fournisseurAvecCaisse();

    await provider.creerPaiement({
      userId: 'u1',
      email: 'lea@exemple.fr',
      plan: 'YEARLY',
      devise: 'USD',
    });

    expect(creer.mock.calls[0][0].line_items[0].price).toBe('price_usd');
  });

  it('retombe sur les euros quand aucun tarif en dollars n est declare', async () => {
    process.env.STRIPE_PRICE_YEARLY = 'price_eur';
    delete process.env.STRIPE_PRICE_YEARLY_USD;

    const { provider, creer } = fournisseurAvecCaisse();

    await provider.creerPaiement({
      userId: 'u1',
      email: 'lea@exemple.fr',
      plan: 'YEARLY',
      devise: 'USD',
    });

    expect(creer.mock.calls[0][0].line_items[0].price).toBe('price_eur');
  });
});
