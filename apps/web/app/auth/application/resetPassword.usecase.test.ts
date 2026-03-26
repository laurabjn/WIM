import { resetPassword } from './resetPassword.usecase';

describe('resetPassword use case', () => {
  const API_URL = 'http://localhost:3002/api';

  beforeEach(() => {
    (global as any).fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = API_URL;
  });

  it('should call /auth/reset-password with token and newPassword', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password has been reset successfully.' }),
    });

    await resetPassword({ token: 'jwt-token', newPassword: 'NewPass123' });

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        token: 'jwt-token',
        newPassword: 'NewPass123',
      }),
    });
  });

  it('should throw on error response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid token' }),
    });

    await expect(
      resetPassword({ token: 'bad', newPassword: 'NewPass123' }),
    ).rejects.toThrow('Invalid token');
  });
});