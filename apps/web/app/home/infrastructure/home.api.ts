import { Home } from '@wim/shared/home/home.type';
import { HomeAvailability } from '@wim/shared/home/homeAvailability.type';
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
  const response = await fetch(`${API_URL}/favorites/${homeId}`, {
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
  const response = await fetch(`${API_URL}/favorites/${homeId}`, {
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

export type ChampsLogement = {
  title: string;
  description: string;
  address?: string;
  city: string;
  country: string;
  capacity: number;
  beds: number;
  bedrooms: number;
  bathrooms: number;
  homeType: string;
  category?: 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';
  amenities: string[];
  isAvailableForExchange: boolean;
  pricePerNight?: number;
  carExchangeAccepted: boolean;
  vehicle?: {
    brand?: string;
    model?: string;
    seats?: number;
    type?: string;
  };
};

export class ErreurLogement extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function lireLogement(response: Response) {
  const brut = await response.text();
  const data = brut ? JSON.parse(brut) : null;

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;

    throw new ErreurLogement(
      message ?? 'Une erreur est survenue',
      data?.code,
    );
  }

  return data;
}

export async function createHome(
  token: string,
  champs: ChampsLogement,
): Promise<Home> {
  const response = await fetch(`${API_URL}/homes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(champs),
  });

  return normalizeHome(await lireLogement(response));
}

export async function updateHome(
  token: string,
  homeId: string,
  champs: ChampsLogement,
): Promise<Home> {
  const response = await fetch(`${API_URL}/homes/${homeId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(champs),
  });

  return normalizeHome(await lireLogement(response));
}

export async function deleteHome(
  token: string,
  homeId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/homes/${homeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await lireLogement(response);
}

export async function uploadHomePhoto(
  token: string,
  homeId: string,
  fichier: File,
): Promise<Home> {
  const corps = new FormData();

  corps.append('file', fichier);

  const response = await fetch(`${API_URL}/homes/${homeId}/photos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: corps,
  });

  return normalizeHome(await lireLogement(response));
}

export async function getAvailabilities(
  homeId: string,
): Promise<HomeAvailability[]> {
  const response = await fetch(`${API_URL}/homes/${homeId}/availabilities`, {
    cache: 'no-store',
  });

  return lireLogement(response);
}

export async function addAvailability(
  token: string,
  homeId: string,
  periode: { startDate: string; endDate: string; type: 'AVAILABLE' | 'BLOCKED' },
): Promise<HomeAvailability> {
  const response = await fetch(`${API_URL}/homes/${homeId}/availabilities`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(periode),
  });

  return lireLogement(response);
}

export async function removeAvailability(
  token: string,
  homeId: string,
  availabilityId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/homes/${homeId}/availabilities/${availabilityId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  await lireLogement(response);
}
