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

export type AnalyseAdmin = {
  inscriptions: { septJours: number; trenteJours: number; total: number };
  activite: { actifsSeptJours: number; jamaisRevenus: number };
  verification: Record<string, number>;
  logements: { total: number; ouverts: number; sansPhoto: number };
  echanges: Record<string, number>;
  conversations: { total: number; sansReponse: number };
  villesRecherchees: { ville: string; recherches: number }[];
  series: {
    semaine: string;
    inscriptions: number;
    echanges: number;
    messages: number;
  }[];
};

export function getAnalyticsApi(token: string) {
  return appeler<AnalyseAdmin>(token, '/admin/analytics');
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

export type SignalementRecu = {
  id: string;
  reason: string;
  message: string | null;
  createdAt: string;
  handledAt: string | null;
  reporter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  review: {
    id: string;
    score: number;
    comment: string;
    createdAt: string;
  } | null;
};

export type DossierCompte = {
  compte: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: string;
    lastSeenAt: string | null;
    suspendedAt: string | null;
    identityStatus: string;
    logements: number;
    messages: number;
    avis: number;
    signalementsEmis: number;
    signalementsRecus: number;
    auteursDistincts: number;
  };
  signalements: SignalementRecu[];
  logements: {
    id: string;
    title: string;
    city: string;
    country: string;
    ouvert: boolean;
    photo: string | null;
  }[];
};

export function getAccountFileApi(token: string, userId: string) {
  return appeler<DossierCompte>(token, `/admin/users/${userId}/file`);
}
