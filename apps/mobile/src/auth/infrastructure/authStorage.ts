import * as SecureStore from 'expo-secure-store';

import { API_URL } from 'src/config/api';

const ACCESS_TOKEN_KEY = 'wim.accessToken';
const REFRESH_TOKEN_KEY = 'wim.refreshToken';
const USER_KEY = 'wim.user';
const LAST_EMAIL_KEY = 'wim.lastEmail';

export interface StoredUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isAdmin: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
}

export async function saveSession(session: AuthSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
  ]);
}

const RENEW_MARGIN_MS = 60 * 1000;

const ALPHABET_B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64Url(entree: string): string {
  const normalise = entree.replace(/-/g, '+').replace(/_/g, '/');

  let bits = 0;
  let valeur = 0;
  let sortie = '';

  for (const caractere of normalise) {
    const index = ALPHABET_B64.indexOf(caractere);

    if (index === -1) continue;

    valeur = (valeur << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      sortie += String.fromCharCode((valeur >> bits) & 0xff);
    }
  }

  return sortie;
}

function expiresAt(token: string): number {
  const corps = token.split('.')[1];

  if (!corps) return 0;

  const trouve = /"exp"\s*:\s*(\d+)/.exec(decodeBase64Url(corps));

  return trouve ? Number(trouve[1]) * 1000 : 0;
}

let renouvellementEnCours: Promise<AuthSession | null> | null = null;

async function renouveler(
  session: AuthSession,
): Promise<AuthSession | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await clearSession();

        return null;
      }

      return session;
    }

    const data = await response.json();

    if (!data?.accessToken || !data?.refreshToken) return null;

    const renouvelee: AuthSession = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: session.user,
    };

    await saveSession(renouvelee);

    return renouvelee;
  } catch (error) {
    console.log('Refresh session error:', error);

    return session;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (!accessToken || !refreshToken || !userRaw) return null;

  let session: AuthSession;

  try {
    const user: StoredUser = JSON.parse(userRaw);
    session = { accessToken, refreshToken, user };
  } catch {
    await clearSession();
    return null;
  }

  if (Date.now() < expiresAt(session.accessToken) - RENEW_MARGIN_MS) {
    return session;
  }

  if (!renouvellementEnCours) {
    renouvellementEnCours = renouveler(session).finally(() => {
      renouvellementEnCours = null;
    });
  }

  return renouvellementEnCours;
}

export async function rememberEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(LAST_EMAIL_KEY, email.trim());
}

export async function getRememberedEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(LAST_EMAIL_KEY);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

export async function getIsAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user.isAdmin === true;
}