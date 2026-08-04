import { API_URL } from '../../config/api';
import { Home } from "@wim/shared/home/home.type";


const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');

export function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_BASE_URL}${url}`;
}

function normalizeHome(home: Home): Home {
  return {
    ...home,
    photos: home.photos?.map((photo) => ({
      ...photo,
      url: resolveImageUrl(photo.url) ?? '',
    })) ?? [],
    vehicle: home.vehicle
      ? {
          ...home.vehicle,
          imageUrl: resolveImageUrl(home.vehicle.imageUrl),
        }
      : null,
  };
}

export async function listMyHomes(token: string): Promise<Home[]> {
  const response = await fetch(`${API_URL}/homes/me/list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.log('List my homes API error:', response.status, text);
    throw new Error(text || 'Impossible de charger les logements');
  }

  const data = await response.json();

  return data.map(normalizeHome);
}

export async function createHome(token: string, homeData: Partial<Home>): Promise<Home> {
  console.log('TOKEN BEFORE REQUEST:', token);
console.log('AUTH HEADER:', `Bearer ${token}`);
  console.log('Creating home with data:', homeData);
  console.log('API URL:', API_URL);
  const response = await fetch(`${API_URL}/homes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(homeData),
  });
    console.log(response)
  if (!response.ok) {
    const text = await response.text();
    console.log('Create home API error:', response.status, text);
    throw new Error(text || 'Impossible de créer le logement');
  }

  if (response.status === 401) {
    const text = await response.text();
    throw new Error(text);
  }
    
  const data = await response.json();
  console.log('Create home API response data:', data);

  return normalizeHome(data);
}

export async function updateHome(token: string, homeId: string, homeData: Partial<Home>): Promise<Home> {
  const response = await fetch(`${API_URL}/homes/${homeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(homeData),
  });
    
  if (!response.ok) {
    const text = await response.text();
    console.log('Update home API error:', response.status, text);
    throw new Error(text || 'Impossible de mettre à jour le logement');
  }
    
  const data = await response.json();

  return normalizeHome(data);
}

export async function getHomeById(token: string, homeId: string): Promise<Home> {
  const response = await fetch(`${API_URL}/homes/${homeId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    
  if (!response.ok) {
    throw new Error('Impossible de charger le logement');
  }
    
  const data = await response.json();

  return normalizeHome(data);
}

export async function listFavoriteHomes(token: string): Promise<Home[]> {
  const response = await fetch(`${API_URL}/favorites/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.log('List favorite homes API error:', response.status, text);
    throw new Error(text || 'Impossible de charger les favoris');
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