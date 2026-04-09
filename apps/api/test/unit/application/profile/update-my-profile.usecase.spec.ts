import { UpdateMyProfileUseCase } from "src/application/profile/use-cases/update-my-profile.usecase";

describe('UpdateMyProfileUseCase', () => {
  it('updates profile successfully', async () => {
    const repo = {
      updateProfile: jest.fn().mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        firstName: 'Laura',
        lastName: 'Bojon',
        avatarUrl: null,
        bio: 'Hello',
        country: 'France',
        nationalité: 'Française',
        phone: '1234567890',
        birthDate: '1990-01-01',
        languages: ['fr', 'en'],
        preferredLocale: 'fr',
        travelPreferences: {
          preferredCountries: ['France'],
          preferredHomeTypes: ['apartment'],
          minCapacity: 1,
          maxCapacity: 4,
          carExchangeAccepted: false,
          flexibleDates: true,
        },
      }),
    };

    const useCase = new UpdateMyProfileUseCase(repo as any);

    const result = await useCase.execute('1', {
      bio: 'Hello',
      country: 'France',
      preferredLocale: 'fr',
      languages: ['fr', 'en'],
    });

    expect(repo.updateProfile).toHaveBeenCalled();
    expect(result.country).toBe('France');
  });

  it('throws on invalid locale', async () => {
    const repo = {
      updateProfile: jest.fn(),
    };

    const useCase = new UpdateMyProfileUseCase(repo as any);

    await expect(
      useCase.execute('1', {
        preferredLocale: 'es' as any,
      }),
    ).rejects.toThrow('Invalid locale');
  });
});