import { logoutUser } from './logoutUser.usecase';
import * as storage from '../infrastructure/authStorage';

describe('logoutUser (mobile)', () => {
  const clearSessionSpy = jest.spyOn(storage, 'clearSession');

  beforeEach(() => {
    (global as any).fetch = jest.fn();
    (global as any).API_URL = 'http://10.0.2.2:3002/api';
    clearSessionSpy.mockClear();
  });

  it('should call /auth/logout and clear session', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' }),
    });

    await logoutUser();

    expect(fetch).toHaveBeenCalled();
    expect(clearSessionSpy).toHaveBeenCalled();
  });
});