import { LoginResult, LoginUser } from "../dtos/loginUser";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export async function loginUserApi(payload: LoginUser): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  console.log('Login response:', { status: response.status, data });

  if (!response.ok) {
    const message = data?.message || 'Login failed';
    throw new Error(message);
  }

  return data as LoginResult;
}