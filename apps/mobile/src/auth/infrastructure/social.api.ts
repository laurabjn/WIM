import { API_URL } from 'src/config/api';

export type Fournisseur = 'GOOGLE' | 'APPLE';

export type ResultatConnexion = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isAdmin: boolean;
  };
  accessToken: string;
  refreshToken: string;
};

export async function signInWithProviderApi(
  provider: Fournisseur,
  idToken: string,
  firstName?: string | null,
  lastName?: string | null,
): Promise<ResultatConnexion> {
  const response = await fetch(`${API_URL}/auth/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, idToken, firstName, lastName }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'La connexion a echoue');
  }

  return data as ResultatConnexion;
}
