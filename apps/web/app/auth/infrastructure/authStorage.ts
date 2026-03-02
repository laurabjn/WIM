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

// Sauvegarder la session
export function saveSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

// Récupérer la session
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  if (!accessToken || !refreshToken || !userRaw) return null;
  try {
    const user: StoredUser = JSON.parse(userRaw);
    return { accessToken, refreshToken, user };
  } catch {
    return null;
  }
}

// Nettoyer la session
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Vérifier si l'utilisateur connecté est admin
export function getIsAdmin(): boolean {
  const session = getSession();
  return session?.user.isAdmin === true;
}