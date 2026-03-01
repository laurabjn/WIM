import { requestPasswordReset } from './requestPassword.usecase';

describe('requestPasswordReset (mobile)', () => {
  const API_URL = 'http://localhost:3002/api';
    
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    (global as any).API_URL = API_URL;
  });

  it('should call /auth/forgot-password', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ok' }),
    });

    await requestPasswordReset('test@example.com', 'en');

    expect(fetch).toHaveBeenCalled();
  });
});