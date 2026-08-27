import { API_URL } from 'src/config/api';

export type CompteAdmin = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  suspendedAt: string | null;
  identityStatus: string;
  createdAt: string;
  logements: number;
  signalements: number;
};

export type PoidsRecommandation = Record<string, number>;

async function appeler<T>(
  token: string,
  chemin: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${chemin}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Requête refusée');
  }

  return data as T;
}

export function searchUsersApi(token: string, recherche: string) {
  const parametre = recherche.trim()
    ? `?q=${encodeURIComponent(recherche.trim())}`
    : '';

  return appeler<CompteAdmin[]>(token, `/admin/users${parametre}`);
}

export function setIdentityStatusApi(
  token: string,
  userId: string,
  status: 'NOT_VERIFIED' | 'IN_PROGRESS' | 'VERIFIED' | 'REFUSED',
) {
  return appeler<{ identityStatus: string }>(
    token,
    `/admin/users/${userId}/identity`,
    { method: 'PATCH', body: { status } },
  );
}

export function getWeightsApi(token: string) {
  return appeler<PoidsRecommandation>(token, '/admin/recommendation-weights');
}

export function setWeightsApi(token: string, poids: PoidsRecommandation) {
  return appeler<PoidsRecommandation>(token, '/admin/recommendation-weights', {
    method: 'PATCH',
    body: poids,
  });
}
