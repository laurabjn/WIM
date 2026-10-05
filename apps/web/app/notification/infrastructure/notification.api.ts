import { API_URL } from 'app/home/infrastructure/api';

export type NotificationVue = {
  id: string;
  category: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  lu: boolean;
  createdAt: string;
};

export type PageDeNotifications = {
  notifications: NotificationVue[];
  curseurSuivant: string | null;
};

function entetes(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function lireReponse(response: Response) {
  const brut = await response.text();
  const data = brut ? JSON.parse(brut) : null;

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;

    throw new Error(message ?? 'Une erreur est survenue');
  }

  return data;
}

export async function getNotifications(
  token: string,
  cursor?: string,
): Promise<PageDeNotifications> {
  const response = await fetch(
    cursor
      ? `${API_URL}/notifications?cursor=${encodeURIComponent(cursor)}`
      : `${API_URL}/notifications`,
    { headers: entetes(token), cache: 'no-store' },
  );

  return lireReponse(response);
}

export async function markAllNotificationsRead(
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'POST',
    headers: entetes(token),
  });

  await lireReponse(response);
}

export async function markNotificationRead(
  token: string,
  notificationId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    { method: 'POST', headers: entetes(token) },
  );

  await lireReponse(response);
}
