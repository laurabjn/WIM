import { requestPasswordReset } from './requestPasswordReset.usecase';

describe('requestPasswordReset use case', () => {
  const API_URL = 'http://localhost:3002/api';

  beforeEach(() => {
    (global as any).fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = API_URL;
  });

  it('should call /auth/forgot-password with email and locale', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ok' }),
    });

    await requestPasswordReset('test@example.com', 'en');

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'test@example.com', locale: 'en' }),
    });
  });

  it('should throw on error response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Something went wrong' }),
    });

    await expect(requestPasswordReset('test@example.com', 'en')).rejects.toThrow(
      'Something went wrong',
    );
  });
});