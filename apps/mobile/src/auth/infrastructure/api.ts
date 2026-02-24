import { RegisterUser } from "../dtos/registerUser";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export async function registerUserApi(payload: RegisterUser) {

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message ?? 'Registration failed');
  }

  return data.user;
}