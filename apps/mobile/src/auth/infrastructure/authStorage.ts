import AsyncStorage from '@react-native-async-storage/async-storage';

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
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user));
  console.log('Session saved:', session);
}

export async function getSession(): Promise<AuthSession | null> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (!accessToken || !refreshToken || !userRaw) return null;

  try {
    const user: StoredUser = JSON.parse(userRaw);
    return { accessToken, refreshToken, user };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export async function getIsAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user.isAdmin === true;
}