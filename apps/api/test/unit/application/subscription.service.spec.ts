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
    creerPaiement: jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/abc',
      externalId: 'cs_123',
    }),
    lireEvenement: jest.fn().mockReturnValue(null),
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

  it('paie le parrainage sur la premiere activation', async () => {
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

    expect(referrals.recompenser).toHaveBeenCalled();
  });

  it('ne repaie pas le parrainage a chaque reconduction', async () => {
    const { referrals, service } = creer({
      id: 'ab-1',
      userId: 'user-1',
      plan: 'YEARLY',
      startedAt: new Date(Date.now() - 365 * JOUR_MS),
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
