import type { Exchange } from '@wim/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export async function getMyExchanges(token: string): Promise<Exchange[]> {
  const response = await fetch(`${API_URL}/exchanges/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? 'Impossible de récupérer les échanges');
  }

  return data;
}