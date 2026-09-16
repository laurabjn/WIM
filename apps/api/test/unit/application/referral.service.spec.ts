import { ReferralService, joursOfferts } from 'src/application/subscription/referral.service';

function creer(parrainage: { id: string; referrerId: string; rewardedAt: Date | null } | null) {
  const prisma = {
    referral: {
      findUnique: jest.fn().mockResolvedValue(parrainage),
      update: jest.fn().mockResolvedValue({}),
    },
  };

  return { prisma, service: new ReferralService(prisma as never) };
}

describe('ReferralService.recompenser', () => {
  const declare = process.env.REFERRAL_REWARD_DAYS;

  afterEach(() => {
    if (declare === undefined) {
      delete process.env.REFERRAL_REWARD_DAYS;
    } else {
      process.env.REFERRAL_REWARD_DAYS = declare;
    }
  });

  it('offre une annee aux deux par defaut', async () => {
    delete process.env.REFERRAL_REWARD_DAYS;

    const { service } = creer({ id: 'p-1', referrerId: 'parrain', rewardedAt: null });
    const offrir = jest.fn().mockResolvedValue(undefined);

    await service.recompenser('filleul', offrir);

    expect(offrir).toHaveBeenCalledWith('parrain', 365);
    expect(offrir).toHaveBeenCalledWith('filleul', 365);
  });

  it('suit la duree declaree quand le client la reduit', async () => {
    process.env.REFERRAL_REWARD_DAYS = '90';

    const { service } = creer({ id: 'p-1', referrerId: 'parrain', rewardedAt: null });
    const offrir = jest.fn().mockResolvedValue(undefined);

    await service.recompenser('filleul', offrir);

    expect(offrir).toHaveBeenCalledWith('parrain', 90);
    expect(joursOfferts()).toBe(90);
  });

  it('ne recompense qu une fois, quel que soit le nombre de logements', async () => {
    const { prisma, service } = creer({
      id: 'p-1',
      referrerId: 'parrain',
      rewardedAt: new Date(),
    });
    const offrir = jest.fn();

    await service.recompenser('filleul', offrir);

    expect(offrir).not.toHaveBeenCalled();
    expect(prisma.referral.update).not.toHaveBeenCalled();
  });

  it('ne fait rien pour qui n a pas ete parraine', async () => {
    const { service } = creer(null);
    const offrir = jest.fn();

    await service.recompenser('filleul', offrir);

    expect(offrir).not.toHaveBeenCalled();
  });

  it('marque la recompense avant de la verser, pour ne jamais la verser deux fois', async () => {
    const { prisma, service } = creer({ id: 'p-1', referrerId: 'parrain', rewardedAt: null });
    const ordre: string[] = [];

    prisma.referral.update.mockImplementation(async () => {
      ordre.push('marque');
    });

    await service.recompenser('filleul', async () => {
      ordre.push('verse');
    });

    expect(ordre[0]).toBe('marque');
  });
});
