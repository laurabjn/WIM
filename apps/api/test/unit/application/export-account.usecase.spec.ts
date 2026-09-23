import { ExportAccountUseCase } from 'src/application/auth/use-cases/export-account.usecase';

function creer(compte: Record<string, unknown> | null) {
  const prisma = {
    user: { findUnique: jest.fn().mockResolvedValue(compte) },
  };
  const emailSender = { send: jest.fn().mockResolvedValue(undefined) };

  return {
    prisma,
    emailSender,
    useCase: new ExportAccountUseCase(prisma as never, emailSender as never),
  };
}

const lea = {
  id: 'user-1',
  email: 'lea@exemple.fr',
  firstName: 'Léa',
  lastName: 'Bonnet',
  passwordHash: '$2b$10$secret',
  birthDate: new Date('1990-04-12'),
  nationality: 'FR',
  country: 'FR',
  phone: null,
  languages: ['fr'],
  bio: null,
  avatarUrl: null,
  identityStatus: 'VERIFIED',
  createdAt: new Date('2026-01-01'),
  preferredLocale: 'fr',
  profileVisible: true,
  showAge: true,
  showPreciseLocation: false,
  dataSharing: false,
  allowMessages: true,
  currency: 'EUR',
  distanceUnit: 'km',
  referralCode: 'WIMLEA',
  homes: [],
  favorites: [],
  searchHistory: [],
  swipesMade: [],
  reviews: [],
  messages: [
    { chatId: 'chat-1', content: 'Bonjour !', type: 'TEXT', createdAt: new Date() },
  ],
  subscription: null,
  referralsMade: [],
  referralReceived: null,
};

function dossierJoint(emailSender: { send: jest.Mock }) {
  const piece = emailSender.send.mock.calls[0][0].piecesJointes[0];

  return { piece, contenu: JSON.parse(piece.contenu) };
}

describe('ExportAccountUseCase', () => {
  it('refuse un compte inconnu', async () => {
    await expect(creer(null).useCase.execute('user-x')).rejects.toThrow(
      'introuvable',
    );
  });

  it('joint un fichier JSON date du jour', async () => {
    const { useCase, emailSender } = creer(lea);

    await useCase.execute('user-1');

    const { piece } = dossierJoint(emailSender);
    const jour = new Date().toISOString().slice(0, 10);

    expect(piece.nom).toBe(`wim-mes-donnees-${jour}.json`);
    expect(piece.type).toBe('application/json');
  });

  it('rend au membre ses donnees, sans son mot de passe', async () => {
    const { useCase, emailSender } = creer(lea);

    await useCase.execute('user-1');

    const { piece, contenu } = dossierJoint(emailSender);

    expect(contenu.compte.email).toBe('lea@exemple.fr');
    expect(contenu.compte.identiteVerifiee).toBe(true);
    expect(contenu.compte.reglages.devise).toBe('EUR');
    expect(contenu.parrainage.monCode).toBe('WIMLEA');
    expect(piece.contenu).not.toContain('$2b$10$');
    expect(JSON.stringify(contenu)).not.toContain('passwordHash');
  });

  it('ne retient que les messages ecrits par le membre', async () => {
    const { useCase, prisma, emailSender } = creer(lea);

    await useCase.execute('user-1');

    const lecture = prisma.user.findUnique.mock.calls[0][0];

    expect(lecture.include.messages.select).toEqual({
      chatId: true,
      content: true,
      type: true,
      createdAt: true,
    });

    const { contenu } = dossierJoint(emailSender);

    expect(contenu.messagesEnvoyes).toHaveLength(1);
    expect(contenu.messagesEnvoyes[0].contenu).toBe('Bonjour !');
  });

  it('ecrit dans la langue du compte', async () => {
    const { useCase, emailSender } = creer({ ...lea, preferredLocale: 'en' });

    await useCase.execute('user-1');

    expect(emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Your WIM data' }),
    );
  });

  it('remonte l echec de l envoi plutot que de le taire', async () => {
    const { useCase, emailSender } = creer(lea);

    emailSender.send.mockRejectedValue(new Error('SMTP injoignable'));

    await expect(useCase.execute('user-1')).rejects.toThrow('SMTP injoignable');
  });
});
