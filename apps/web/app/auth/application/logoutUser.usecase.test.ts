import { logoutUser } from './logout.usecase';
import * as storage from '../infrastructure/authStorage';

describe('logoutUser use case', () => {
  const API_URL = 'http://localhost:3002/api';

  const clearSessionSpy = jest.spyOn(storage, 'clearSession');

  beforeEach(() => {
    (global as any).fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = API_URL;
    clearSessionSpy.mockClear();
  });

  it('should call /auth/logout and clear session', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' }),
    });

    await logoutUser();

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    expect(clearSessionSpy).toHaveBeenCalled();
  });

  it('should still clear session if /auth/logout fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error' }),
    });

    await logoutUser();

    expect(clearSessionSpy).toHaveBeenCalled();
  });
});