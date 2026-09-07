import { getCityImagesApi } from './cityImages';
import { getSession } from 'src/auth/infrastructure/authStorage';

jest.mock('src/auth/infrastructure/authStorage', () => ({
  getSession: jest.fn(),
}));

const session = jest.mocked(getSession);

describe('getCityImagesApi', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    session.mockResolvedValue({
      accessToken: 'jeton',
      refreshToken: 'refraichir',
      user: { id: 'u1', email: 'a@b.fr', isAdmin: false },
    } as never);
  });

  it('ne demande rien sans ville', async () => {
    await expect(getCityImagesApi('   ', 'France')).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('ne demande rien sans session', async () => {
    session.mockResolvedValue(null);

    await expect(getCityImagesApi('Lyon', 'France')).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rend les images et transmet le pays et le nombre demande', async () => {
    const images = [{ id: '1', url: 'petite', grande: 'grande' }];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images }),
    });

    await expect(getCityImagesApi('Lyon', 'France', 2)).resolves.toEqual(images);

    const [adresse, options] = (fetch as jest.Mock).mock.calls[0];

    expect(adresse).toContain('/locations/Lyon/images');
    expect(adresse).toContain('country=France');
    expect(adresse).toContain('count=2');
    expect(options.headers.Authorization).toBe('Bearer jeton');
  });

  it('encode une ville comportant un espace', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: [] }),
    });

    await getCityImagesApi('La Rochelle', 'France');

    expect((fetch as jest.Mock).mock.calls[0][0]).toContain(
      '/locations/La%20Rochelle/images',
    );
  });

  it('rend une liste vide quand le serveur refuse', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    await expect(getCityImagesApi('Lyon', 'France')).resolves.toEqual([]);
  });

  it('rend une liste vide quand le reseau tombe', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('injoignable'));

    await expect(getCityImagesApi('Lyon', 'France')).resolves.toEqual([]);
  });
});
