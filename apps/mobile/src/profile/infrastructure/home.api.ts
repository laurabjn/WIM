import { MyHome } from "@wim/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

export async function fetchMyHomes(token: string): Promise<MyHome[]> {
  console.log('Fetching homes with token:', token);
  const response = await fetch(`${API_URL}/homes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les logements');
  }
  console.log('API response status:', response.status);
  const homes = await response.json();
  console.log('Fetched homes:', homes);
  return homes;
}