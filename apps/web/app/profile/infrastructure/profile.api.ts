import type { UserProfile } from '@wim/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function getMyProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/me/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

export async function updateMyProfile(
  token: string,
  payload: Partial<UserProfile>,
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/users/me/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}

export async function uploadMyAvatar(
  token: string,
  file: File,
): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload avatar');
  }

  return response.json();
}