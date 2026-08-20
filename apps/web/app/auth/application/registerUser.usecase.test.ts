import { registerUser } from "./registerUser.usecase";

describe('registerUser use case', () => {
  const API_URL = 'http://localhost:3002/api';

  beforeEach(() => {
    (global as any).fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = API_URL;
  });

  it('should call /auth/register with correct payload and return user', async () => {
    const fakeUser = {
      id: 'uuid-1',
      email: 'test@example.com',
      firstName: 'Laura',
      lastName: 'Bojon',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: fakeUser, identityRedirectUrl: 'http://redirect.url' }),
    });

    const result = await registerUser({
      email: 'test@example.com',
      password: 'secret123',
      firstName: 'Laura',
      lastName: 'Bojon',
      isAdmin: false,
    });

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'secret123',
        firstName: 'Laura',
        lastName: 'Bojon',
        isAdmin: false,
      }),
      credentials: 'include',
    });

    expect(result).toEqual({
      user: fakeUser,
      identityRedirectUrl: 'http://redirect.url',
    });
  });

  it('should throw on API error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Email already in use' }),
    });

    await expect(
      registerUser({
        email: 'existing@example.com',
        password: 'secret123',
        firstName: 'Laura',
        lastName: 'Bojon',
        isAdmin: false,
      }),
    ).rejects.toThrow('Email already in use');
  });
});