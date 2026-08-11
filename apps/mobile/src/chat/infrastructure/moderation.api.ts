import { API_URL } from '../../config/api';

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function blockUserApi(
  token: string,
  userId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/moderation/block/${userId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  if (!response.ok) throw new Error('Le blocage a échoué');
}

export async function reportUserApi(
  token: string,
  userId: string,
  reason: string,
  message?: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/moderation/report/${userId}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason, message }),
  });

  if (!response.ok) throw new Error('Le signalement a échoué');
}
