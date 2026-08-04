import { API_URL } from '../../config/api';
import { FavoriteHome } from "@wim/shared";



export async function getFavoriteHomes(token: string): Promise<FavoriteHome[]> {
  const response = await fetch(`${API_URL}/favorites`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const rawText = await response.text();
  console.log('FAVORITES STATUS:', response.status);
  console.log('FAVORITES RAW RESPONSE:', rawText);

  if (!response.ok) {
    throw new Error(`Favorites API error ${response.status}: ${rawText}`);
  }

  try {
    return JSON.parse(rawText) as FavoriteHome[];
  } catch {
    throw new Error(`Invalid JSON returned by favorites API: ${rawText}`);
  }
}