import { RegisterUserPayload, AuthUser, LoginResult } from '../dtos/authUser';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function registerUserApi(payload: RegisterUserPayload): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  console.log('API response:', { status: response.status, data });

  if (!response.ok) {
    const message = data?.message || 'Registration failed';
    throw new Error(message);
  }

  return data.user as AuthUser;
}

export async function loginUserApi(payload: { email: string; password: string }): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  console.log('API response:', { status: response.status, data });

  if (!response.ok) {
    const message = data?.message || 'Login failed';
    throw new Error(message);
  }

  return data as LoginResult;
}