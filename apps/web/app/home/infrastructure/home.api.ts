import { Home } from '@wim/shared/home/home.type';
import { API_URL, resolveImageUrl } from './api';

function normalizeHome(home: Home): Home {
  return {
    ...home,
    photos:
      home.photos?.map((photo) => ({
        ...photo,
        url: resolveImageUrl(photo.url),
      })) ?? [],
    vehicle: home.vehicle
      ? {
          ...home.vehicle,
          imageUrl: resolveImageUrl(home.vehicle.imageUrl),
        }
      : null,
  };
}

export async function getPublicHomes(): Promise<Home[]> {
  const response = await fetch(`${API_URL}/homes`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les logements');
  }

  const data = await response.json();

  return data.map(normalizeHome);
}

export type FiltresRecherche = {
  city?: string;
  country?: string;
  capacity?: number;
  bedrooms?: number;
  homeType?: string;
  amenities?: string[];
  category?: 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';
  startDate?: string;
  endDate?: string;
};

export async function searchHomes(filtres: FiltresRecherche): Promise<Home[]> {
  const parametres = new URLSearchParams();

  for (const [cle, valeur] of Object.entries(filtres)) {
    if (valeur === undefined || valeur === '' || valeur === null) continue;

    parametres.set(cle, Array.isArray(valeur) ? valeur.join(',') : String(valeur));
  }

  const requete = parametres.toString();

  const requeteComplete = requete
    ? `${API_URL}/homes/search?${requete}`
    : `${API_URL}/homes/search`;

  const response = await fetch(requeteComplete, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Impossible de chercher les logements');
  }

  const data = await response.json();

  return data.map(normalizeHome);
}

export async function getHomeById(homeId: string): Promise<Home> {
  const response = await fetch(`${API_URL}/homes/${homeId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger le logement');
  }

  const data = await response.json();

  return normalizeHome(data);
}

export async function getHomesByOwnerId(ownerId: string): Promise<Home[]> {
  const response = await fetch(`${API_URL}/homes/owner/${ownerId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les logements');
  }

  const data = await response.json();

  return data.map(normalizeHome);
}

export async function addFavoriteHome(
  token: string,
  homeId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/homes/${homeId}/favorite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Impossible d’ajouter aux favoris');
  }
}

export async function removeFavoriteHome(
  token: string,
  homeId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/homes/${homeId}/favorite`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Impossible de retirer des favoris');
  }
}

export async function getMyHomes(token: string): Promise<Home[]> {
  const response = await fetch(`${API_URL}/homes/me/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger mes logements');
  }

  const data = await response.json();

  return data.map(normalizeHome);
}

export async function listFavoriteHomes(token: string): Promise<Home[]> {
  const response = await fetch(`${API_URL}/favorites/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les favoris');
  }

  const data = await response.json();

  return data.map(normalizeHome);
}
