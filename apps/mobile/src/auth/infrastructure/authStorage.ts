import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'wim.accessToken';
const REFRESH_TOKEN_KEY = 'wim.refreshToken';
const USER_KEY = 'wim.user';

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

export async function getSession(): Promise<AuthSession | null> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (!accessToken || !refreshToken || !userRaw) return null;

  try {
    const user: StoredUser = JSON.parse(userRaw);
    return { accessToken, refreshToken, user };
  } catch {
    await clearSession();
    return null;
  }
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