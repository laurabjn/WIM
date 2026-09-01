import { API_URL } from '../../config/api';
import { Home } from "@wim/shared/home/home.type";


type SearchHomesParams = {
  city?: string;
  country?: string;
  capacity?: number;
  bedrooms?: number;
  homeType?: string;
  amenities?: string[];
  category?: 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';
  startDate?: string;
  endDate?: string;
};

export async function searchHomesApi(
  token: string,
  params: SearchHomesParams,
): Promise<Home[]> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;

    if (Array.isArray(value)) {
      if (value.length > 0) searchParams.append(key, value.join(','));
      return;
    }

    searchParams.append(key, String(value));
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