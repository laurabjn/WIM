import { SignInWithProviderUseCase } from 'src/application/auth/use-cases/sign-in-with-provider.usecase';
import type { IdentiteExterne } from 'src/application/auth/ports/social-identity.port';

describe('SignInWithProviderUseCase', () => {
  const compte = {
    id: 'user-1',
    email: 'lea@exemple.fr',
    firstName: 'Lea',
    lastName: 'Martin',
    identityStatus: 'VERIFIED',
    isAdmin: false,
    suspendedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const identite: IdentiteExterne = {
    providerId: 'google-abc',
    email: 'lea@exemple.fr',
    emailVerifie: true,
    firstName: 'Lea',
    lastName: 'Martin',
  };

  function creer(surcharges: Record<string, unknown> = {}) {
    const prisma = {
      authIdentity: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(compte),
        create: jest.fn().mockResolvedValue({ id: 'user-2' }),
      },
      ...surcharges,
    };

    const verificateur = { verifier: jest.fn().mockResolvedValue(identite) };

    return {
      prisma,
      verificateur,
      useCase: new SignInWithProviderUseCase(
        prisma as never,
        verificateur as never,
      ),
    };
  }

  it('reconnait une identite deja rattachee sans toucher a l e-mail', async () => {
    const { prisma, useCase } = creer();
    prisma.authIdentity.findUnique.mockResolvedValue({ userId: 'user-1' });

    const resultat = await useCase.execute({
      provider: 'GOOGLE',
      idToken: 'jeton',
    });

    expect(resultat.id).toBe('user-1');
    expect(prisma.authIdentity.create).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rattache le fournisseur a un compte existant de meme adresse', async () => {
    const { prisma, useCase } = creer();

    await useCase.execute({ provider: 'GOOGLE', idToken: 'jeton' });

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.authIdentity.create).toHaveBeenCalledWith({
      data: {
        provider: 'GOOGLE',
        providerId: 'google-abc',
        userId: 'user-1',
      },
    });
  });

  it('cree un compte quand l adresse est inconnue', async () => {
    const { prisma, useCase } = creer();
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ ...compte, id: 'user-2' });

    await useCase.execute({ provider: 'APPLE', idToken: 'jeton' });

    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.authIdentity.create).toHaveBeenCalled();
  });

  it('refuse une adresse non verifiee par le fournisseur', async () => {
    const { verificateur, useCase } = creer();
    verificateur.verifier.mockResolvedValue({
      ...identite,
      emailVerifie: false,
    });

    await expect(
      useCase.execute({ provider: 'GOOGLE', idToken: 'jeton' }),
    ).rejects.toThrow("Ce compte ne fournit pas d'adresse e-mail verifiee.");
  });

  it('refuse un compte d administration deja rattache', async () => {
    const { prisma, useCase } = creer();
    prisma.authIdentity.findUnique.mockResolvedValue({ userId: 'user-1' });
    prisma.user.findUnique.mockResolvedValue({ ...compte, isAdmin: true });

    await expect(
      useCase.execute({ provider: 'GOOGLE', idToken: 'jeton' }),
    ).rejects.toThrow('mot de passe');
  });

  it('refuse de rattacher un fournisseur a un compte d administration', async () => {
    const { prisma, useCase } = creer();
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', isAdmin: true });

    await expect(
      useCase.execute({ provider: 'GOOGLE', idToken: 'jeton' }),
    ).rejects.toThrow('mot de passe');

    expect(prisma.authIdentity.create).not.toHaveBeenCalled();
  });

  it('refuse un compte suspendu', async () => {
    const { prisma, useCase } = creer();
    prisma.user.findUnique.mockResolvedValue({
      ...compte,
      suspendedAt: new Date(),
    });

    await expect(
      useCase.execute({ provider: 'GOOGLE', idToken: 'jeton' }),
    ).rejects.toThrow('suspendu');
  });
});
