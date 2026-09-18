import { SubscriptionService } from 'src/application/subscription/subscription.service';

const JOUR_MS = 24 * 60 * 60 * 1000;

type Abonnement = {
  id?: string;
  userId?: string;
  plan?: string;
  status?: string;
  startedAt?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelledAt?: Date | null;
  externalId?: string | null;
};

function creer(
  abonnement: Abonnement | null,
  options: { resilier?: boolean } = {},
) {
  const prisma = {
    subscription: {
      findUnique: jest.fn().mockResolvedValue(abonnement),
      update: jest.fn().mockResolvedValue(abonnement),
      upsert: jest.fn().mockResolvedValue(abonnement),
      create: jest.fn().mockResolvedValue(abonnement),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ email: 'lea@exemple.fr' }),
    },
  };

  const provider = {
    tarifs: jest.fn().mockResolvedValue({ MONTHLY: null, YEARLY: null }),
    ouvrirLePortail: jest.fn().mockResolvedValue('https://portail.stripe.com/x'),
    resilier: jest.fn().mockResolvedValue(options.resilier ?? true),
    offrirDesJours: jest.fn().mockResolvedValue(null),
    moyensDePaiement: jest.fn().mockResolvedValue([]),
    definirLeMoyenPrincipal: jest.fn().mockResolvedValue(true),
    retirerLeMoyen: jest.fn().mockResolvedValue(true),
    ajouterUnMoyen: jest.fn().mockResolvedValue('https://enregistrement'),
    creerPaiement: jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/abc',
      externalId: 'cs_123',
    }),
    lireEvenement: jest.fn().mockReturnValue(null),
    reconnait: jest.fn((id: string) => id.startsWith('sub_') || id.startsWith('cs_')),
  };

  const referrals = { recompenser: jest.fn().mockResolvedValue(undefined) };

  return {
    prisma,
    provider,
    referrals,
    service: new SubscriptionService(
      prisma as never,
      referrals as never,
      provider as never,
    ),
  };
}

describe('SubscriptionService.annuler', () => {
  it('coupe la reconduction chez le prestataire avant de toucher la base', async () => {
    const { prisma, provider, service } = creer({
      id: 'ab-1',
      status: 'ACTIVE',
      externalId: 'sub_456',
      currentPeriodEnd: new Date(Date.now() + JOUR_MS),
    });

    await service.annuler('user-1');

    expect(provider.resilier).toHaveBeenCalledWith('sub_456');
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
  });

  it('laisse la base intacte quand le prestataire ne confirme pas', async () => {
    const { prisma, service } = creer(
      { id: 'ab-1', status: 'ACTIVE', externalId: 'sub_456' },
      { resilier: false },
    );

    await expect(service.annuler('user-1')).rejects.toThrow(
      'transmise au prestataire',
    );

    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });

  it('resilie sans prestataire un abonnement offert', async () => {
    const { prisma, provider, service } = creer({
      id: 'ab-1',
      status: 'ACTIVE',
      externalId: null,
      currentPeriodEnd: new Date(Date.now() + JOUR_MS),
    });

    await service.annuler('user-1');

    expect(provider.resilier).not.toHaveBeenCalled();
    expect(prisma.subscription.update).toHaveBeenCalled();
  });

  it('refuse de resilier deux fois', async () => {
    const { service } = creer({ id: 'ab-1', status: 'CANCELLED' });

    await expect(service.annuler('user-1')).rejects.toThrow(
      'Aucun abonnement à annuler',
    );
  });
});

describe('SubscriptionService.venteAutorisee', () => {
  const declare = process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS;

  afterEach(() => {
    if (declare === undefined) {
      delete process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS;
    } else {
      process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS = declare;
    }
  });

  it('ouvre la vente partout tant que rien n est ferme', () => {
    delete process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS;

    const { service } = creer(null);

    expect(service.venteAutorisee('ios')).toBe(true);
    expect(service.venteAutorisee('android')).toBe(true);
  });

  it('ferme la vente sur la seule plateforme nommee', () => {
    process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS = 'ios';

    const { service } = creer(null);

    expect(service.venteAutorisee('ios')).toBe(false);
    expect(service.venteAutorisee('android')).toBe(true);
  });

  it('accepte une liste, avec des espaces et des majuscules', () => {
    process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS = ' iOS , Android ';

    const { service } = creer(null);

    expect(service.venteAutorisee('ios')).toBe(false);
    expect(service.venteAutorisee('android')).toBe(false);
  });

  it('laisse passer un appel sans plateforme declaree', () => {
    process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS = 'ios';

    const { service } = creer(null);

    expect(service.venteAutorisee()).toBe(true);
  });

  it('annonce dans l etat que la vente est fermee', async () => {
    process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS = 'ios';

    const { service } = creer(null);

    await expect(service.etat('user-1', 'ios')).resolves.toMatchObject({
      venteDansLApp: false,
    });
  });
});

describe('SubscriptionService pendant la periode de lancement', () => {
  const declare = process.env.SUBSCRIPTION_REQUIRED_FROM;
  const dansUnAn = new Date(Date.now() + 365 * JOUR_MS);

  beforeEach(() => {
    process.env.SUBSCRIPTION_REQUIRED_FROM = dansUnAn.toISOString();
  });

  afterAll(() => {
    if (declare === undefined) {
      delete process.env.SUBSCRIPTION_REQUIRED_FROM;
    } else {
      process.env.SUBSCRIPTION_REQUIRED_FROM = declare;
    }
  });

  it('ouvre les echanges a tout le monde sans rien souscrire', async () => {
    const { prisma, service } = creer(null);

    await expect(service.estActif('user-1')).resolves.toBe(true);

    expect(prisma.subscription.findUnique).not.toHaveBeenCalled();
  });

  it('annonce la date jusqu a laquelle l acces est libre', async () => {
    const { service } = creer(null);

    await expect(service.etat('user-1')).resolves.toMatchObject({
      actif: true,
      statut: 'NONE',
      accesLibreJusquAu: dansUnAn.toISOString(),
    });
  });

  it('refuse d ouvrir une caisse tant que l acces est libre', async () => {
    const { provider, service } = creer(null);

    await expect(service.demarrer('user-1', 'YEARLY')).rejects.toThrow(
      "L'accès est libre jusqu'au",
    );

    expect(provider.creerPaiement).not.toHaveBeenCalled();
  });

  it('fait demarrer un cadeau a la fin de la periode de lancement', async () => {
    const { prisma, service } = creer(null);

    await service.offrirDesJours('user-1', 365);

    const donnees = prisma.subscription.create.mock.calls[0][0].data;

    expect(donnees.currentPeriodEnd.getTime()).toBe(
      dansUnAn.getTime() + 365 * JOUR_MS,
    );
  });

  it('redevient exigeant une fois la date passee', async () => {
    process.env.SUBSCRIPTION_REQUIRED_FROM = new Date(
      Date.now() - JOUR_MS,
    ).toISOString();

    const { service } = creer(null);

    await expect(service.estActif('user-1')).resolves.toBe(false);
    await expect(service.etat('user-1')).resolves.toMatchObject({
      actif: false,
      accesLibreJusquAu: null,
    });
  });

  it('ignore une date illisible', async () => {
    process.env.SUBSCRIPTION_REQUIRED_FROM = 'bientot';

    const { service } = creer(null);

    await expect(service.estActif('user-1')).resolves.toBe(false);
  });
});

describe('SubscriptionService.etat', () => {
  it('laisse courir jusqu a son terme une periode deja reglee', async () => {
    const { service } = creer({
      plan: 'YEARLY',
      status: 'CANCELLED',
      currentPeriodEnd: new Date(Date.now() + 10 * JOUR_MS),
      cancelledAt: new Date(),
    });

    await expect(service.etat('user-1')).resolves.toMatchObject({
      actif: true,
      statut: 'CANCELLED',
    });
  });

  it('ferme les echanges des que la periode est passee', async () => {
    const { service } = creer({
      plan: 'YEARLY',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() - JOUR_MS),
    });

    await expect(service.etat('user-1')).resolves.toMatchObject({
      actif: false,
    });
  });

  it('affiche l abonnement meme quand les tarifs sont injoignables', async () => {
    const { provider, service } = creer({
      plan: 'YEARLY',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + JOUR_MS),
    });

    provider.tarifs.mockRejectedValue(new Error('Stripe injoignable'));

    await expect(service.etat('user-1')).resolves.toMatchObject({
      actif: true,
      tarifs: { MONTHLY: null, YEARLY: null },
    });
  });
});

describe('SubscriptionService.demarrer', () => {
  it('refuse de faire payer deux fois un abonne en cours', async () => {
    const { provider, service } = creer({
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + JOUR_MS),
    });

    await expect(service.demarrer('user-1', 'YEARLY')).rejects.toThrow(
      'déjà actif',
    );

    expect(provider.creerPaiement).not.toHaveBeenCalled();
  });

  it('retient la caisse ouverte pour reconnaitre le paiement au retour', async () => {
    const { prisma, service } = creer(null);

    await expect(service.demarrer('user-1', 'YEARLY')).resolves.toEqual({
      url: 'https://checkout.stripe.com/abc',
    });

    expect(prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          status: 'PENDING',
          externalId: 'cs_123',
        }),
      }),
    );
  });
});

describe('SubscriptionService.appliquerVerdict', () => {
  it('remplace l identifiant de caisse par celui de l abonnement', async () => {
    const { prisma, service } = creer({
      id: 'ab-1',
      userId: 'user-1',
      plan: 'YEARLY',
      startedAt: null,
      externalId: 'cs_123',
    });

    await service.appliquerVerdict({
      externalId: 'cs_123',
      nouvelExternalId: 'sub_456',
      statut: 'ACTIVE',
      finDePeriode: null,
    });

    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          externalId: 'sub_456',
          status: 'ACTIVE',
        }),
      }),
    );
  });

  it('ne melange pas le parrainage aux verdicts de paiement', async () => {
    const { referrals, service } = creer({
      id: 'ab-1',
      userId: 'user-1',
      plan: 'YEARLY',
      startedAt: null,
      externalId: 'sub_456',
    });

    await service.appliquerVerdict({
      externalId: 'sub_456',
      statut: 'ACTIVE',
      finDePeriode: null,
    });

    expect(referrals.recompenser).not.toHaveBeenCalled();
  });

  it('ignore un verdict qui ne correspond a aucun abonnement', async () => {
    const { prisma, service } = creer(null);

    await service.appliquerVerdict({
      externalId: 'sub_inconnu',
      statut: 'ACTIVE',
      finDePeriode: null,
    });

    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });
});

describe('SubscriptionService.moyens de paiement', () => {
  it('n a rien a lister sans abonnement', async () => {
    const { provider, service } = creer(null);

    await expect(service.moyensDePaiement('user-1')).resolves.toEqual([]);

    expect(provider.moyensDePaiement).not.toHaveBeenCalled();
  });

  it('refuse d ajouter un moyen sans abonnement', async () => {
    const { service } = creer(null);

    await expect(service.ajouterUnMoyen('user-1')).rejects.toThrow(
      'Aucun abonnement',
    );
  });

  it('signale un moyen que le prestataire ne reconnait pas', async () => {
    const { provider, service } = creer({ externalId: 'sub_456' });

    provider.retirerLeMoyen.mockResolvedValue(false);

    await expect(service.retirerLeMoyen('user-1', 'pm_x')).rejects.toThrow(
      'introuvable',
    );
  });

  it('renvoie la liste a jour apres un changement de principal', async () => {
    const { provider, service } = creer({ externalId: 'sub_456' });

    provider.moyensDePaiement.mockResolvedValue([
      { id: 'pm_1', type: 'card', libelle: 'Visa', detail: '4242', principal: true },
    ]);

    await expect(
      service.definirLeMoyenPrincipal('user-1', 'pm_1'),
    ).resolves.toHaveLength(1);

    expect(provider.definirLeMoyenPrincipal).toHaveBeenCalledWith('sub_456', 'pm_1');
  });
});

describe('SubscriptionService.recompenserLeParrainage', () => {
  it('offre les jours des deux cotes par le meme chemin que tout cadeau', async () => {
    const { referrals, prisma, service } = creer(null);

    referrals.recompenser.mockImplementation(
      async (refereeId: string, offrir: (id: string, jours: number) => Promise<void>) => {
        await offrir('parrain', 365);
        await offrir(refereeId, 365);
      },
    );

    await service.recompenserLeParrainage('filleul');

    expect(referrals.recompenser).toHaveBeenCalledWith('filleul', expect.any(Function));
    expect(prisma.subscription.create).toHaveBeenCalledTimes(2);
  });
});

describe('SubscriptionService.portail', () => {
  it('refuse d ouvrir un portail sans abonnement', async () => {
    const { service } = creer(null);

    await expect(service.portail('user-1')).rejects.toThrow(
      'Aucun abonnement a gerer',
    );
  });

  it('signale l indisponibilite plutot que de renvoyer une adresse vide', async () => {
    const { provider, service } = creer({ externalId: 'sub_456' });

    provider.ouvrirLePortail.mockResolvedValue(null);

    await expect(service.portail('user-1')).rejects.toThrow('indisponible');
  });
});

describe('SubscriptionService.offrirDesJours', () => {
  it('prend la date que le prestataire a fixee quand il porte le cadeau', async () => {
    const finStripe = new Date(Date.now() + 400 * JOUR_MS);

    const { prisma, provider, service } = creer({
      id: 'ab-1',
      plan: 'YEARLY',
      externalId: 'sub_456',
      currentPeriodEnd: new Date(Date.now() + 100 * JOUR_MS),
    });

    provider.offrirDesJours.mockResolvedValue(finStripe);

    await service.offrirDesJours('user-1', 30);

    expect(provider.offrirDesJours).toHaveBeenCalledWith('sub_456', 30);
    expect(prisma.subscription.update.mock.calls[0][0].data.currentPeriodEnd).toEqual(
      finStripe,
    );
  });

  it('prolonge la periode en cours au lieu de la remplacer', async () => {
    const fin = new Date(Date.now() + 100 * JOUR_MS);

    const { prisma, service } = creer({
      id: 'ab-1',
      plan: 'YEARLY',
      currentPeriodEnd: fin,
    });

    await service.offrirDesJours('user-1', 30);

    const donnees = prisma.subscription.update.mock.calls[0][0].data;

    expect(donnees.currentPeriodEnd.getTime()).toBe(
      fin.getTime() + 30 * JOUR_MS,
    );
  });

  it('ne date pas dans le passe un cadeau fait a un abonnement expire', async () => {
    const { prisma, service } = creer({
      id: 'ab-1',
      plan: 'YEARLY',
      currentPeriodEnd: new Date(Date.now() - 100 * JOUR_MS),
    });

    await service.offrirDesJours('user-1', 30);

    const donnees = prisma.subscription.update.mock.calls[0][0].data;

    expect(donnees.currentPeriodEnd.getTime()).toBeGreaterThan(Date.now());
  });

  it('ouvre une periode a qui n avait aucun abonnement', async () => {
    const { prisma, service } = creer(null);

    await service.offrirDesJours('user-1', 30);

    expect(prisma.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE', plan: 'YEARLY' }),
      }),
    );
  });
});

describe('SubscriptionService.demarrer pour un etudiant', () => {
  const declare = process.env.STRIPE_STUDENT_COUPON;

  afterEach(() => {
    if (declare === undefined) {
      delete process.env.STRIPE_STUDENT_COUPON;
    } else {
      process.env.STRIPE_STUDENT_COUPON = declare;
    }
  });

  it('passe le bon etudiant a la caisse quand le statut est valide', async () => {
    process.env.STRIPE_STUDENT_COUPON = 'ETUDIANT50';

    const { prisma, provider, service } = creer(null);

    prisma.user.findUnique.mockResolvedValue({
      email: 'lea@exemple.fr',
      studentVerifiedUntil: new Date(Date.now() + 100 * JOUR_MS),
    });

    await service.demarrer('user-1', 'YEARLY');

    expect(provider.creerPaiement).toHaveBeenCalledWith(
      expect.objectContaining({ coupon: 'ETUDIANT50' }),
    );
  });

  it('ne passe aucun bon quand le statut a expire', async () => {
    process.env.STRIPE_STUDENT_COUPON = 'ETUDIANT50';

    const { prisma, provider, service } = creer(null);

    prisma.user.findUnique.mockResolvedValue({
      email: 'lea@exemple.fr',
      studentVerifiedUntil: new Date(Date.now() - JOUR_MS),
    });

    await service.demarrer('user-1', 'YEARLY');

    expect(provider.creerPaiement.mock.calls[0][0].coupon).toBeUndefined();
  });
});

describe('SubscriptionService.etat et la facturation', () => {
  it('signale qu un abonnement offert n a rien a facturer', async () => {
    const { service } = creer({
      plan: 'YEARLY',
      status: 'ACTIVE',
      externalId: null,
      currentPeriodEnd: new Date(Date.now() + 100 * JOUR_MS),
    });

    await expect(service.etat('user-1')).resolves.toMatchObject({
      actif: true,
      facturable: false,
    });
  });

  it('ne prend pas un abonnement de demonstration pour un abonnement Stripe', async () => {
    const { service } = creer({
      plan: 'YEARLY',
      status: 'ACTIVE',
      externalId: 'demo_sophie',
      currentPeriodEnd: new Date(Date.now() + 100 * JOUR_MS),
    });

    await expect(service.etat('user-1')).resolves.toMatchObject({
      facturable: false,
    });
  });

  it('signale qu un abonnement Stripe se gere', async () => {
    const { service } = creer({
      plan: 'YEARLY',
      status: 'ACTIVE',
      externalId: 'sub_456',
      currentPeriodEnd: new Date(Date.now() + 100 * JOUR_MS),
    });

    await expect(service.etat('user-1')).resolves.toMatchObject({
      facturable: true,
    });
  });
});
