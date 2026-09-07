import { CreateHomeUseCase } from 'src/application/home/use-cases/create-home.usecase';

describe('CreateHomeUseCase', () => {
  const saisie = {
    ownerId: 'user-1',
    title: 'Logement a Bruges',
    description: 'Un logement lumineux',
    address: '1 rue du test',
    city: 'Bruges',
    country: 'Belgique',
    latitude: null,
    longitude: null,
    capacity: 2,
    beds: 1,
    bedrooms: 1,
    bathrooms: 1,
    homeType: 'HOUSE',
    category: null,
    amenities: [],
    isAvailableForExchange: true,
    pricePerNight: null,
    averageRating: null,
    reviewCount: 0,
    carExchangeAccepted: false,
    vehicle: null,
  } as never;

  function creer(existants: unknown[] = []) {
    const homeRepository = {
      findByOwnerId: jest.fn().mockResolvedValue(existants),
      create: jest.fn().mockImplementation(async (data) => ({
        id: 'nouveau',
        ...data,
      })),
    };

    return {
      homeRepository,
      useCase: new CreateHomeUseCase(homeRepository as never),
    };
  }

  it('cree le logement quand le proprietaire n en a aucun', async () => {
    const { homeRepository, useCase } = creer();

    await useCase.execute(saisie);

    expect(homeRepository.create).toHaveBeenCalled();
  });

  it('rend le logement deja cree plutot que d en ajouter un second', async () => {
    const dejaLa = {
      id: 'logement-1',
      title: 'Logement a Bruges',
      city: 'Bruges',
      createdAt: new Date(Date.now() - 5000),
    };

    const { homeRepository, useCase } = creer([dejaLa]);

    await expect(useCase.execute(saisie)).resolves.toBe(dejaLa);
    expect(homeRepository.create).not.toHaveBeenCalled();
  });

  it('laisse creer a nouveau passe le delai de garde', async () => {
    const ancien = {
      id: 'logement-1',
      title: 'Logement a Bruges',
      city: 'Bruges',
      createdAt: new Date(Date.now() - 120 * 1000),
    };

    const { homeRepository, useCase } = creer([ancien]);

    await useCase.execute(saisie);

    expect(homeRepository.create).toHaveBeenCalled();
  });

  it('ne confond pas deux logements distincts de la meme personne', async () => {
    const autre = {
      id: 'logement-1',
      title: 'Logement a Lyon',
      city: 'Lyon',
      createdAt: new Date(),
    };

    const { homeRepository, useCase } = creer([autre]);

    await useCase.execute(saisie);

    expect(homeRepository.create).toHaveBeenCalled();
  });

  it('refuse une saisie incomplete avant toute ecriture', async () => {
    const { homeRepository, useCase } = creer();

    await expect(
      useCase.execute({ ...(saisie as object), city: '  ' } as never),
    ).rejects.toThrow('ville');

    expect(homeRepository.findByOwnerId).not.toHaveBeenCalled();
    expect(homeRepository.create).not.toHaveBeenCalled();
  });
});
