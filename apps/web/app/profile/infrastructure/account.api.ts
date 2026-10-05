import { API_URL, SERVER_URL } from 'app/home/infrastructure/api';

export type BlockedUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  blockedAt: string;
};

export type SupportTopic =
  | 'account'
  | 'booking'
  | 'exchange'
  | 'payment'
  | 'technical'
  | 'other';

function entetes(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function verifier(response: Response) {
  if (response.ok) return;

  const data = await response.json().catch(() => null);
  const message = Array.isArray(data?.message)
    ? data.message.join(', ')
    : data?.message;

  throw new Error(message ?? 'Une erreur est survenue');
}

export async function exportMyData(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/me/export`, {
    method: 'POST',
    headers: entetes(token),
  });

  await verifier(response);
}

export async function deleteMyAccount(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'DELETE',
    headers: entetes(token),
  });

  await verifier(response);
}

export async function getBlockedUsers(token: string): Promise<BlockedUser[]> {
  const response = await fetch(`${API_URL}/moderation/blocked`, {
    headers: entetes(token),
    cache: 'no-store',
  });

  await verifier(response);

  const data: BlockedUser[] = await response.json();

  return data.map((bloque) => ({
    ...bloque,
    avatarUrl: bloque.avatarUrl
      ? bloque.avatarUrl.startsWith('http')
        ? bloque.avatarUrl
        : `${SERVER_URL}${bloque.avatarUrl}`
      : null,
  }));
}

export async function unblockUser(
  token: string,
  userId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/moderation/block/${userId}`, {
    method: 'DELETE',
    headers: entetes(token),
  });

  await verifier(response);
}

export async function startIdentityVerification(
  token: string,
): Promise<{ url?: string | null }> {
  const response = await fetch(`${API_URL}/identity/start`, {
    method: 'POST',
    headers: entetes(token),
  });

  await verifier(response);

  return response.json().catch(() => ({}));
}

export async function contactSupport(
  token: string,
  payload: { topic: SupportTopic; subject: string; message: string },
): Promise<void> {
  const response = await fetch(`${API_URL}/support/contact`, {
    method: 'POST',
    headers: { ...entetes(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  await verifier(response);
}
