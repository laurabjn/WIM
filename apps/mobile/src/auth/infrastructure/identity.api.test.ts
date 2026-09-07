import {
  fetchIdentityStatus,
  startIdentityVerification,
} from './identity.api';
import { getSession } from './authStorage';

jest.mock('./authStorage', () => ({
  getSession: jest.fn(),
}));

const session = jest.mocked(getSession);

describe('identity.api', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    session.mockResolvedValue({
      accessToken: 'jeton',
      refreshToken: 'refraichir',
      user: { id: 'u1', email: 'a@b.fr', isAdmin: false },
    } as never);
  });

  describe('fetchIdentityStatus', () => {
    it('rend le statut renvoye par le serveur', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'VERIFIED' }),
      });

      await expect(fetchIdentityStatus()).resolves.toBe('VERIFIED');
    });

    it('refuse de deviner sans session', async () => {
      session.mockResolvedValue(null);

      await expect(fetchIdentityStatus()).rejects.toThrow('Not authenticated');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('remonte le message du serveur en cas de refus', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Compte suspendu' }),
      });

      await expect(fetchIdentityStatus()).rejects.toThrow('Compte suspendu');
    });
  });

  describe('startIdentityVerification', () => {
    it('rend l adresse de Stripe et celle du retour', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          redirectUrl: 'https://verify.stripe.com/abc',
          returnUrl: 'https://worldismine.fr/verification-identite',
        }),
      });

      await expect(startIdentityVerification()).resolves.toEqual({
        redirectUrl: 'https://verify.stripe.com/abc',
        returnUrl: 'https://worldismine.fr/verification-identite',
      });
    });

    it('remonte le refus d une verification deja obtenue', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Identity already verified' }),
      });

      await expect(startIdentityVerification()).rejects.toThrow(
        'Identity already verified',
      );
    });
  });
});
