import {
  POIDS_PAR_DEFAUT,
  RecommendationWeightsService,
} from 'src/application/swipe/services/recommendation-weights.service';

describe('RecommendationWeightsService', () => {
  function creer(enregistre: Record<string, unknown> | null = null) {
    const prisma = {
      appSetting: {
        findUnique: jest
          .fn()
          .mockResolvedValue(enregistre ? { value: enregistre } : null),
        upsert: jest.fn().mockResolvedValue({}),
      },
    };

    return { prisma, service: new RecommendationWeightsService(prisma as never) };
  }

  it('rend les valeurs par defaut quand rien n a jamais ete regle', async () => {
    const { service } = creer();

    await expect(service.valeurs()).resolves.toEqual(POIDS_PAR_DEFAUT);
  });

  it('ramene une valeur negative a zero', async () => {
    const { prisma, service } = creer();

    const valeurs = await service.remplacer({ rechercheVille: -40 });

    expect(valeurs.rechercheVille).toBe(0);
    expect(prisma.appSetting.upsert).toHaveBeenCalled();
  });

  it('plafonne une valeur excessive a cent', async () => {
    const { service } = creer();

    const valeurs = await service.remplacer({ rechercheVille: 5000 });

    expect(valeurs.rechercheVille).toBe(100);
  });

  it('arrondit une valeur decimale', async () => {
    const { service } = creer();

    const valeurs = await service.remplacer({ rechercheVille: 12.6 });

    expect(valeurs.rechercheVille).toBe(13);
  });

  it('ignore ce qui n est pas un nombre plutot que de casser le classement', async () => {
    const { service } = creer();

    const valeurs = await service.remplacer({
      rechercheVille: 'beaucoup',
    } as never);

    expect(valeurs.rechercheVille).toBe(
      POIDS_PAR_DEFAUT.rechercheVille,
    );
  });

  it('ignore une cle inconnue', async () => {
    const { service } = creer();

    const valeurs = await service.remplacer({ inventee: 42 } as never);

    expect(valeurs).toEqual(POIDS_PAR_DEFAUT);
    expect('inventee' in valeurs).toBe(false);
  });

  it('conserve les autres poids quand on n en change qu un', async () => {
    const { service } = creer();

    const valeurs = await service.remplacer({ rechercheVille: 30 });

    expect(valeurs.recherchePays).toBe(POIDS_PAR_DEFAUT.recherchePays);
  });

  it('complete par les defauts un enregistrement incomplet', async () => {
    const { service } = creer({ rechercheVille: 7 });

    const valeurs = await service.valeurs();

    expect(valeurs.rechercheVille).toBe(7);
    expect(valeurs.recherchePays).toBe(POIDS_PAR_DEFAUT.recherchePays);
  });
});
