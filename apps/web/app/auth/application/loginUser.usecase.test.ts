import { loginUser } from "./loginUser.usecase";

describe('loginUser use case', () => {
  const API_URL = 'http://localhost:3002/api';

  beforeEach(() => {
    (global as any).fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = API_URL;
  });

  it('should call /auth/login and return user + tokens', async () => {
    const fakeResponse = {
      user: {
        id: 'uuid-1',
        email: 'test@example.com',
        firstName: 'Laura',
        lastName: 'Bojon',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => fakeResponse,
    });

    const result = await loginUser({
      email: 'test@example.com',
      password: 'secretPassword123',
    });

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'secretPassword123',
      }),
    });

    expect(result).toEqual(fakeResponse);
  });

  it('should throw on invalid credentials', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid email or password' }),
    });

    await expect(
      loginUser({
        email: 'wrong@example.com',
        password: 'badPassword123',
      }),
    ).rejects.toThrow('Invalid email or password');
  });
});