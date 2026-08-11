import { API_URL } from '../../config/api';

export type MatchItem = {
  id: string;
  status: string;
  createdAt: string;
  chatId: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    country: string | null;
  };
};

export async function getMyMatchesApi(token: string): Promise<MatchItem[]> {
  const response = await fetch(`${API_URL}/matches/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les matchs');
  }

  return response.json();
}
