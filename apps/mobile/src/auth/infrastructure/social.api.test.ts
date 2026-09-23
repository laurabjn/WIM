import { signInWithProviderApi } from './social.api';

describe('signInWithProviderApi', () => {
  const reponse = {
    user: {
      id: 'u1',
      email: 'lea@exemple.fr',
      firstName: 'Lea',
      lastName: 'Martin',
      isAdmin: false,
    },
    accessToken: 'acces',
    refreshToken: 'refraichir',
  };

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  it('transmet le fournisseur, le jeton et le nom', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => reponse,
    });

    await expect(
      signInWithProviderApi('APPLE', 'jeton', 'Lea', 'Martin'),
    ).resolves.toEqual(reponse);

    const [adresse, options] = (fetch as jest.Mock).mock.calls[0];

    expect(adresse).toContain('/auth/social');
    expect(JSON.parse(options.body)).toEqual({
      provider: 'APPLE',
      idToken: 'jeton',
      firstName: 'Lea',
      lastName: 'Martin',
    });
  });

  it('remonte le message du serveur quand il refuse', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Les comptes d'administration se connectent avec leur mot de passe.",
      }),
    });

    await expect(signInWithProviderApi('GOOGLE', 'jeton')).rejects.toThrow(
      "Les comptes d'administration se connectent avec leur mot de passe.",
    );
  });

  it('reste explicite quand le serveur ne dit rien', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('corps illisible');
      },
    });

    await expect(signInWithProviderApi('GOOGLE', 'jeton')).rejects.toThrow(
      'La connexion a echoue',
    );
  });
});
