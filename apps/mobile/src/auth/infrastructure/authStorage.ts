import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'wim.accessToken';
const REFRESH_TOKEN_KEY = 'wim.refreshToken';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

export async function getSession(): Promise<AuthSession | null> {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}