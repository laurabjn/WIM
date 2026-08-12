import { loginUser } from "./loginUser.usecase";

describe('loginUser (mobile)', () => {
  const API_URL = 'http://localhost:3002/api';

  beforeEach(() => {
    (global as any).fetch = jest.fn();
    (global as any).API_URL = API_URL;
  });

  it('should call /auth/login and return result', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: 'uuid-1', email: 'test@example.com', firstName: 'Test', lastName: 'User', isAdmin: false },
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
    });

    const result = await loginUser({
      email: 'test@example.com',
      password: 'secret123',
    });

    expect(fetch).toHaveBeenCalled();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.firstName).toBe('Test');
    expect(result.user.lastName).toBe('User');
    expect(result.user.isAdmin).toBe(false);
  });
});