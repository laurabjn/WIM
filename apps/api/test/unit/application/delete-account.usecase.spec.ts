import { mkdtempSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DeleteAccountUseCase } from 'src/application/auth/use-cases/delete-account.usecase';

function creer(
  compte: Record<string, unknown> | null,
  options: { reconnu?: boolean; dossier?: string } = {},
) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(compte),
      delete: jest.fn().mockReturnValue('suppression-utilisateur'),
    },
    chat: { deleteMany: jest.fn().mockReturnValue('suppression-chats') },
    match: { deleteMany: jest.fn().mockReturnValue('suppression-matchs') },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const provider = {
    reconnait: jest.fn().mockReturnValue(options.reconnu ?? true),
    effacerLeClient: jest.fn().mockResolvedValue(true),
  };
  const emailSender = { send: jest.fn().mockResolvedValue(undefined) };

  return {
    prisma,
    provider,
    emailSender,
    useCase: new DeleteAccountUseCase(
      prisma as never,
      provider as never,
      emailSender as never,
      options.dossier ?? tmpdir(),
    ),
  };
}

const lea = {
  id: 'user-1',
  email: 'lea@exemple.fr',
  isAdmin: false,
  avatarUrl: null,
  preferredLocale: 'fr',
  subscription: { externalId: 'sub_456' },
  homes: [],
};

describe('DeleteAccountUseCase', () => {
  it('refuse un compte inconnu ou un compte administrateur', async () => {
    await expect(creer(null).useCase.execute('user-x')).rejects.toThrow(
      'introuvable',
    );

    const admin = creer({ ...lea, isAdmin: true });

    await expect(admin.useCase.execute('user-1')).rejects.toThrow('introuvable');
    expect(admin.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('efface le client de paiement avant le compte, quand il existe', async () => {
    const { useCase, provider } = creer(lea);

    await useCase.execute('user-1');

    expect(provider.effacerLeClient).toHaveBeenCalledWith('sub_456');
  });

  it('ne sollicite pas le prestataire pour un abonnement qu il ne connait pas', async () => {
    const { useCase, provider } = creer(
      { ...lea, subscription: { externalId: 'demo_lea' } },
      { reconnu: false },
    );

    await useCase.execute('user-1');

    expect(provider.effacerLeClient).not.toHaveBeenCalled();
  });

  it('efface conversations et matchs avant le compte, d un seul tenant', async () => {
    const { useCase, prisma } = creer(lea);

    await useCase.execute('user-1');

    expect(prisma.$transaction).toHaveBeenCalledWith([
      'suppression-chats',
      'suppression-matchs',
      'suppression-utilisateur',
    ]);
    expect(prisma.chat.deleteMany).toHaveBeenCalledWith({
      where: { participants: { some: { userId: 'user-1' } } },
    });
    expect(prisma.match.deleteMany).toHaveBeenCalledWith({
      where: { OR: [{ user1Id: 'user-1' }, { user2Id: 'user-1' }] },
    });
  });

  it('retire du disque les photos et l avatar, et rien d autre', async () => {
    const dossier = mkdtempSync(join(tmpdir(), 'wim-'));

    mkdirSync(join(dossier, 'avatars'), { recursive: true });
    mkdirSync(join(dossier, 'homes'), { recursive: true });
    writeFileSync(join(dossier, 'avatars', 'lea.jpg'), 'x');
    writeFileSync(join(dossier, 'homes', 'maison.jpg'), 'x');
    writeFileSync(join(dossier, 'homes', 'autre.jpg'), 'x');

    const { useCase } = creer(
      {
        ...lea,
        avatarUrl: '/uploads/avatars/lea.jpg',
        homes: [
          {
            photos: [
              { url: '/uploads/homes/maison.jpg' },
              { url: 'https://images.unsplash.com/photo.jpg' },
              { url: '/uploads/../homes/autre.jpg' },
            ],
          },
        ],
      },
      { dossier },
    );

    await useCase.execute('user-1');

    expect(existsSync(join(dossier, 'avatars', 'lea.jpg'))).toBe(false);
    expect(existsSync(join(dossier, 'homes', 'maison.jpg'))).toBe(false);
    expect(existsSync(join(dossier, 'homes', 'autre.jpg'))).toBe(true);
  });

  it('confirme par courriel dans la langue du compte', async () => {
    const { useCase, emailSender } = creer({ ...lea, preferredLocale: 'en' });

    await useCase.execute('user-1');

    expect(emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lea@exemple.fr',
        subject: 'Your WIM account has been deleted',
      }),
    );
  });

  it('supprime le compte meme si le courriel ne part pas', async () => {
    const { useCase, emailSender, prisma } = creer(lea);

    emailSender.send.mockRejectedValue(new Error('SMTP injoignable'));

    await expect(useCase.execute('user-1')).resolves.toBeUndefined();
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
