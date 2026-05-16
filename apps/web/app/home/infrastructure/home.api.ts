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