import { API_URL } from 'src/config/api';
import { getSession } from 'src/auth/infrastructure/authStorage';

export type NotificationItem = {
  id: string;
  category: 'MESSAGES' | 'EXCHANGES';
  title: string;
  body: string;
  data: Record<string, unknown>;
  lu: boolean;
  createdAt: string;
};

async function appeler<T>(chemin: string, method: 'GET' | 'POST' = 'GET') {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${chemin}`, {
    method,
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Requête refusée');
  }

  return data as T;
}

export function fetchNotificationsApi(cursor?: string) {
  return appeler<{
    notifications: NotificationItem[];
    curseurSuivant: string | null;
  }>(`/notifications${cursor ? `?cursor=${cursor}` : ''}`);
}

export function fetchUnreadNotificationsApi() {
  return appeler<{ count: number }>('/notifications/unread-count');
}

export function markNotificationReadApi(id: string) {
  return appeler<{ read: boolean }>(`/notifications/${id}/read`, 'POST');
}

export function markAllNotificationsReadApi() {
  return appeler<{ read: boolean }>('/notifications/read-all', 'POST');
}
