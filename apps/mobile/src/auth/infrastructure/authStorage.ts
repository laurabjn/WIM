import * as SecureStore from 'expo-secure-store';

import { API_URL } from 'src/config/api';

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

/** Marge avant l'echeance : une requete partie juste avant expirerait en vol. */
const RENEW_MARGIN_MS = 60 * 1000;

const ALPHABET_B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * React Native ne fournit pas `atob` : le decodage se fait a la main, sur les
 * seuls caracteres de l'alphabet base64.
 */
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

/**
 * Lit l'echeance inscrite dans le jeton. On extrait le seul champ utile plutot
 * que d'analyser tout le JSON : un accent mal decode ne doit pas faire echouer
 * une lecture de date. Un jeton illisible est traite comme expire.
 */
function expiresAt(token: string): number {
  const corps = token.split('.')[1];

  if (!corps) return 0;

  const trouve = /"exp"\s*:\s*(\d+)/.exec(decodeBase64Url(corps));

  return trouve ? Number(trouve[1]) * 1000 : 0;
}

// Tous les ecrans appellent getSession() : sans ce verrou, l'ouverture d'un
// ecran lancerait autant de renouvellements que de requetes.
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
      // Un refus franc du serveur signifie que la session est morte : la
      // garder ferait echouer chaque ecran en silence.
      if (response.status === 401) await clearSession();

      return null;
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
    // Reseau coupe : on rend la session telle quelle plutot que de deconnecter.
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

  // Le jeton d'acces ne vit qu'un quart d'heure. Sans ce renouvellement, tout
  // l'ecran tombait en erreur passe ce delai, sans rien dire de plus qu'un
  // "impossible de charger".
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