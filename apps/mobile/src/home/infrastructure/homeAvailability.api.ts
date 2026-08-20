import { API_URL } from '../../config/api';
import type {
  CreateHomeAvailabilityPayload,
  HomeAvailability,
} from '@wim/shared';


export async function getHomeAvailabilities(
  homeId: string,
): Promise<HomeAvailability[]> {
  const response = await fetch(`${API_URL}/homes/${homeId}/availabilities`);

  if (!response.ok) {
    throw new Error('Impossible de récupérer les disponibilités');
  }

  return response.json();
}

export async function createHomeAvailability(
  token: string,
  homeId: string,
  payload: CreateHomeAvailabilityPayload,
): Promise<HomeAvailability> {
  const response = await fetch(`${API_URL}/homes/${homeId}/availabilities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? 'Impossible de créer la disponibilité');
  }

  return data;
}

export async function deleteHomeAvailability(
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

  if (!response.ok) {
    throw new Error('Impossible de supprimer la disponibilité');
  }
}