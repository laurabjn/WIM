import { API_URL } from '../../config/api';
import type {
  ChatMessages,
  ChatMessagesPage,
  MyChatListItem,
  MyRequestListItem,
  UnreadMessagesCount,
} from '@wim/shared';

async function parseResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;

    throw new Error(message ?? 'Une erreur est survenue');
  }

  return data;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getChatsApi(
  token: string,
): Promise<MyChatListItem[]> {
  const response = await fetch(`${API_URL}/chats`, {
    headers: authHeaders(token),
  });

  return parseResponse(response);
}

export async function sendPhotoMessageApi(
  token: string,
  chatId: string,
  uri: string,
): Promise<ChatMessages> {
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'jpg';

  const form = new FormData();

  form.append('file', {
    uri,
    name: `message.${extension}`,
    type: extension === 'png' ? 'image/png' : 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${API_URL}/chats/${chatId}/photos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });

  return parseResponse(response);
}

export async function sendVoiceMessageApi(
  token: string,
  chatId: string,
  uri: string,
  durationMs: number,
): Promise<ChatMessages> {
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'm4a';

  const form = new FormData();

  form.append('file', {
    uri,
    name: `message.${extension}`,
    // Android enregistre en 3gp, iOS en m4a : declarer le mauvais type ferait
    // rejeter le fichier par le filtre du serveur.
    type: extension === '3gp' ? 'audio/3gpp' : 'audio/m4a',
  } as unknown as Blob);

  form.append('durationMs', String(Math.round(durationMs)));

  const response = await fetch(`${API_URL}/chats/${chatId}/voice`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });

  return parseResponse(response);
}

export async function getRequestsApi(
  token: string,
): Promise<MyRequestListItem[]> {
  const response = await fetch(`${API_URL}/chats/requests`, {
    headers: authHeaders(token),
  });

  return parseResponse(response);
}

export async function getMessagesApi(
  token: string,
  chatId: string,
  options: { cursor?: string; limit?: number; translate?: boolean } = {},
): Promise<ChatMessagesPage> {
  const params = new URLSearchParams();

  if (options.cursor) params.append('cursor', options.cursor);
  if (options.limit) params.append('limit', String(options.limit));
  if (options.translate) params.append('translate', 'true');

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/chats/${chatId}/messages${query ? `?${query}` : ''}`,
    { headers: authHeaders(token) },
  );

  return parseResponse(response);
}

export async function sendMessageApi(
  token: string,
  chatId: string,
  content: string,
): Promise<ChatMessages> {
  const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ content }),
  });

  return parseResponse(response);
}

export async function markChatAsReadApi(
  token: string,
  chatId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/chats/${chatId}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });

  await parseResponse(response);
}

export async function getUnreadCountApi(
  token: string,
): Promise<UnreadMessagesCount> {
  const response = await fetch(`${API_URL}/chats/unread-count`, {
    headers: authHeaders(token),
  });

  return parseResponse(response);
}
