import { SubscriptionController } from 'src/interfaces/http/controllers/subscription.controller';

type Requete = { rawBody?: Buffer };

function creer(options: { verdict?: unknown; signatureValide?: boolean } = {}) {
  const subscriptions = {
    etat: jest.fn().mockResolvedValue({ statut: 'PENDING' }),
    demarrer: jest.fn().mockResolvedValue({ url: 'https://caisse' }),
    annuler: jest.fn().mockResolvedValue({ actif: false }),
    portail: jest.fn().mockResolvedValue({ url: 'https://portail' }),
    appliquerVerdict: jest.fn().mockResolvedValue(undefined),
    identifiantExterne: jest.fn().mockResolvedValue('cs_123'),
    analyse: jest.fn().mockResolvedValue({}),
    venteAutorisee: jest.fn().mockReturnValue(true),
  };

  const referrals = {
    etat: jest.fn().mockResolvedValue({ code: 'WIM123' }),
    enregistrer: jest.fn().mockResolvedValue(undefined),
  };

  const provider = {
    lireEvenement: jest.fn().mockImplementation(() => {
      if (options.signatureValide === false) {
        throw new Error('signature invalide');
      }

      return options.verdict ?? null;
    }),
  };

  return {
    subscriptions,
    referrals,
    provider,
    controller: new SubscriptionController(
      subscriptions as never,
      referrals as never,
      provider as never,
    ),
  };
}

function requete(corps = '{}'): Requete {
  return { rawBody: Buffer.from(corps) };
}

describe('SubscriptionController.webhook', () => {
  const environnement = process.env.PAYMENT_PROVIDER;

  beforeEach(() => {
    process.env.PAYMENT_PROVIDER = 'stripe';
  });

  afterAll(() => {
    if (environnement === undefined) {
      delete process.env.PAYMENT_PROVIDER;
    } else {
      process.env.PAYMENT_PROVIDER = environnement;
    }
  });

  it('applique le verdict du prestataire', async () => {
    const verdict = {
      externalId: 'cs_123',
      statut: 'ACTIVE',
      finDePeriode: null,
    };

    const { controller, subscriptions } = creer({ verdict });

    await expect(
      controller.webhook(requete() as never, 'signature'),
    ).resolves.toEqual({ received: true });

    expect(subscriptions.appliquerVerdict).toHaveBeenCalledWith(verdict);
  });

  it('accuse reception d un evenement qui ne nous concerne pas', async () => {
    const { controller, subscriptions } = creer();

    await expect(
      controller.webhook(requete() as never, 'signature'),
    ).resolves.toEqual({ received: true });

    expect(subscriptions.appliquerVerdict).not.toHaveBeenCalled();
  });

  it('refuse un appel dont la signature ne tient pas', async () => {
    const { controller, subscriptions } = creer({ signatureValide: false });

    await expect(
      controller.webhook(requete() as never, 'contrefaite'),
    ).rejects.toThrow('Signature invalide');

    expect(subscriptions.appliquerVerdict).not.toHaveBeenCalled();
  });

  it('refuse un appel sans signature', async () => {
    const { controller, provider } = creer();

    await expect(
      controller.webhook(requete() as never, undefined),
    ).rejects.toThrow('Signature manquante');

    expect(provider.lireEvenement).not.toHaveBeenCalled();
  });

  it('refuse un appel sans corps brut, faute de quoi verifier', async () => {
    const { controller, provider } = creer();

    await expect(controller.webhook({} as never, 'signature')).rejects.toThrow(
      'Signature manquante',
    );

    expect(provider.lireEvenement).not.toHaveBeenCalled();
  });

  it('ferme la porte tant qu aucun prestataire n est configure', async () => {
    delete process.env.PAYMENT_PROVIDER;

    const { controller, provider } = creer();

    await expect(
      controller.webhook(requete() as never, 'signature'),
    ).rejects.toThrow('Aucun prestataire de paiement');

    expect(provider.lireEvenement).not.toHaveBeenCalled();
  });
});

describe('SubscriptionController.checkout', () => {
  const utilisateur = { user: { sub: 'user-1', email: 'lea@exemple.fr' } };

  it('ouvre une caisse sur la formule annuelle', async () => {
    const { controller, subscriptions } = creer();

    await expect(
      controller.checkout(utilisateur as never, { plan: 'YEARLY' }),
    ).resolves.toEqual({ url: 'https://caisse' });

    expect(subscriptions.demarrer).toHaveBeenCalledWith('user-1', 'YEARLY');
  });

  it('refuse une formule qui ne se vend plus', async () => {
    const { controller, subscriptions } = creer();

    await expect(
      controller.checkout(utilisateur as never, { plan: 'MONTHLY' }),
    ).rejects.toThrow('Formule inconnue');

    expect(subscriptions.demarrer).not.toHaveBeenCalled();
  });

  it('refuse une demande sans formule', async () => {
    const { controller } = creer();

    await expect(
      controller.checkout(utilisateur as never, {}),
    ).rejects.toThrow('Formule inconnue');
  });

  it('refuse la vente sur une plateforme fermee', async () => {
    const { controller, subscriptions } = creer();

    subscriptions.venteAutorisee.mockReturnValue(false);

    await expect(
      controller.checkout(utilisateur as never, { plan: 'YEARLY' }, 'ios'),
    ).rejects.toThrow('ne se souscrit pas depuis cette application');

    expect(subscriptions.demarrer).not.toHaveBeenCalled();
  });

  it('laisse passer la vente sur une plateforme ouverte', async () => {
    const { controller, subscriptions } = creer();

    await controller.checkout(utilisateur as never, { plan: 'YEARLY' }, 'android');

    expect(subscriptions.venteAutorisee).toHaveBeenCalledWith('android');
    expect(subscriptions.demarrer).toHaveBeenCalled();
  });
});

describe('SubscriptionController.mien', () => {
  const utilisateur = { user: { sub: 'user-1', email: 'lea@exemple.fr' } };

  it('transmet la plateforme pour que l etat sache quoi proposer', async () => {
    const { controller, subscriptions } = creer();

    await controller.mien(utilisateur as never, 'ios');

    expect(subscriptions.etat).toHaveBeenCalledWith('user-1', 'ios');
  });
});

describe('SubscriptionController.simuler', () => {
  const utilisateur = { user: { sub: 'user-1', email: 'lea@exemple.fr' } };
  const environnement = process.env.PAYMENT_PROVIDER;
  const execution = process.env.NODE_ENV;

  beforeEach(() => {
    delete process.env.PAYMENT_PROVIDER;
    process.env.NODE_ENV = execution;
  });

  afterAll(() => {
    if (environnement === undefined) {
      delete process.env.PAYMENT_PROVIDER;
    } else {
      process.env.PAYMENT_PROVIDER = environnement;
    }

    process.env.NODE_ENV = execution;
  });

  it('confirme un paiement en attente quand rien n encaisse', async () => {
    const { controller, subscriptions } = creer();

    await controller.simuler(utilisateur as never);

    expect(subscriptions.appliquerVerdict).toHaveBeenCalledWith(
      expect.objectContaining({ externalId: 'cs_123', statut: 'ACTIVE' }),
    );
  });

  it('se ferme des qu un prestataire encaisse vraiment', async () => {
    process.env.PAYMENT_PROVIDER = 'stripe';

    const { controller, subscriptions } = creer();

    await expect(controller.simuler(utilisateur as never)).rejects.toThrow(
      'La simulation est refusée ici',
    );

    expect(subscriptions.appliquerVerdict).not.toHaveBeenCalled();
  });

  it('reste fermee en production quoi qu il arrive', async () => {
    process.env.NODE_ENV = 'production';

    const { controller, subscriptions } = creer();

    await expect(controller.simuler(utilisateur as never)).rejects.toThrow(
      'La simulation est refusée ici',
    );

    expect(subscriptions.appliquerVerdict).not.toHaveBeenCalled();
  });

  it('refuse de confirmer un abonnement qui n attend rien', async () => {
    const { controller, subscriptions } = creer();

    subscriptions.etat.mockResolvedValue({ statut: 'ACTIVE' });

    await expect(controller.simuler(utilisateur as never)).rejects.toThrow(
      'Aucun paiement en attente',
    );
  });
});
