import { API_URL } from '../../config/api';
import { Home } from "@wim/shared/home/home.type";


type SearchHomesParams = {
  city?: string;
  country?: string;
  capacity?: number;
  homeType?: string;
  startDate?: string;
  endDate?: string;
};

export async function searchHomesApi(
  token: string,
  params: SearchHomesParams,
): Promise<Home[]> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_URL}/homes/search?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? 'Erreur lors de la recherche');
  }

  return data;
}