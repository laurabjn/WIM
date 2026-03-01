import { resetPassword } from './resetPassword.usecase';

describe('resetPassword (mobile)', () => {
  const API_URL = 'http://localhost:3002/api';
    
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    (global as any).API_URL = API_URL;
  });
    
  it('should call /auth/reset-password', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ok' }),
    });

    await resetPassword({ token: 'jwt', newPassword: 'NewPass123' });

    expect(fetch).toHaveBeenCalled();
  });
});