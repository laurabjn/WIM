import { getSession, saveSession, clearSession } from './authStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

const MARGE_SECONDES = 120;

function expiration(jeton: string): number | null {
  const charge = jeton.split('.')[1];

  if (!charge) return null;

  try {
    const json = atob(charge.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };

    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

export function bientotExpire(jeton: string): boolean {
  const fin = expiration(jeton);

  if (fin === null) return false;

  return fin - Date.now() / 1000 < MARGE_SECONDES;
}

export async function rafraichirLaSession(): Promise<boolean> {
  const session = getSession();

  if (!session) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!response.ok) {
      if (response.status === 401) clearSession();

      return false;
    }

    const data = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (!data.accessToken || !data.refreshToken) return false;

    saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: session.user,
    });

    return true;
  } catch {
    return false;
  }
}
