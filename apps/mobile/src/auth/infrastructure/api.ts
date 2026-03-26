import { LoginUser, LoginResult } from "../dtos/loginUser";
import { RegisterUser, RegisterUserResponse } from "../dtos/registerUser";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

export async function registerUserApi(payload: RegisterUser): Promise<RegisterUserResponse> {

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  console.log('Register API response:', { status: res.status, data });

  if (!res.ok) {
    throw new Error(data?.message ?? 'Registration failed');
  }

  return {
    user: data.user,
    identityRedirectUrl: data.identityRedirectUrl,
  };
}

export async function loginUserApi(payload: LoginUser): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  console.log('API loginUserApi response:', {
    status: response.status,
    data,
  });

  if (!response.ok) {
    const message = data?.message || 'Login failed';
    throw new Error(message);
  }

  return data as LoginResult;
}