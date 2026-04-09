import { MyHome } from "@wim/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

export async function fetchMyHomes(token: string): Promise<MyHome[]> {
  const response = await fetch(`${API_URL}/homes/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les logements');
  }

  return response.json();
}