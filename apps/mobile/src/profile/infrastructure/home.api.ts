import { API_URL } from '../../config/api';
import { MyHome } from "@wim/shared";


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