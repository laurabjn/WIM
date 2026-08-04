import { API_URL } from '../../config/api';
import type { UserProfile } from '@wim/shared';


export async function getMyProfile(token: string): Promise<UserProfile> {

  const response = await fetch(`${API_URL}/users/me/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Profile API error ${response.status}: ${rawText}`);
  }

  try {
    return JSON.parse(rawText) as UserProfile;
  } catch {
    throw new Error(`Invalid JSON returned by profile API: ${rawText}`);
  }
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

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Update profile API error ${response.status}: ${rawText}`);
  }

  return JSON.parse(rawText) as UserProfile;
}

export async function getPublicProfile(
  userId: string,
  token?: string | null,
): Promise<Partial<UserProfile>> {
  const response = await fetch(`${API_URL}/users/${userId}/profile`, {
    method: 'GET',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  const rawText = await response.text();
  console.log('PUBLIC PROFILE STATUS:', response.status);
  console.log('PUBLIC PROFILE RAW RESPONSE:', rawText);

  if (!response.ok) {
    throw new Error(`Public profile API error ${response.status}: ${rawText}`);
  }

  try {
    return JSON.parse(rawText) as Partial<UserProfile>;
  } catch {
    throw new Error(`Invalid JSON returned by public profile API: ${rawText}`);
  }
}