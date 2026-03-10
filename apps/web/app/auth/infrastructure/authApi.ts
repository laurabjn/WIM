import {
  RegisterUserPayload,
  AuthUser,
  LoginResult,
  RegisterResult
} from '../dtos/authUser';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function registerUserApi(payload: RegisterUserPayload): Promise<RegisterResult> {
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

  return {
    user: data.user as AuthUser,
    identityRedirectUrl: data.identityRedirectUrl as string | undefined,
  };
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

export async function requestPasswordResetApi(
  email: string,
  locale: 'fr' | 'en',
): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, locale }),
  });

  const data = await response.json().catch(() => ({}));
  console.log('API response:', { status: response.status, data });

  if (!response.ok) {
    const message = data?.message || 'Failed to request password reset';
    throw new Error(message);
  }
}

export async function resetPasswordApi(payload: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  console.log('API response:', { status: response.status, data });
  if (!response.ok) {
    const message = data?.message || 'Failed to reset password';
    throw new Error(message);
  }
}