import type {
  ChatMessages,
  ChatMessagesPage,
  MyChatListItem,
  UnreadMessagesCount,
} from '@wim/shared';

import { API_URL, SERVER_URL } from 'app/home/infrastructure/api';

function resoudreFichier(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;

  return `${SERVER_URL}${url}`;
}

export function normaliserMessage(message: ChatMessages): ChatMessages {
  return {
    ...message,
    attachmentUrl: resoudreFichier(message.attachmentUrl),
    sender: {
      ...message.sender,
      avatarUrl: resoudreFichier(message.sender?.avatarUrl),
    },
  };
}

function normaliserConversation(conversation: MyChatListItem): MyChatListItem {
  return {
    ...conversation,
    participant: {
      ...conversation.participant,
      avatarUrl: resoudreFichier(conversation.participant?.avatarUrl),
    },
    lastMessage: conversation.lastMessage
      ? normaliserMessage(conversation.lastMessage)
      : null,
  };
}

async function lireReponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;

    throw new Error(message ?? 'Une erreur est survenue');
  }

  return data;
}

function entetes(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getMyChats(token: string): Promise<MyChatListItem[]> {
  const response = await fetch(`${API_URL}/chats`, {
    headers: entetes(token),
    cache: 'no-store',
  });

  const data: MyChatListItem[] = await lireReponse(response);

  return data.map(normaliserConversation);
}

export async function getChatMessages(
  token: string,
  chatId: string,
  cursor?: string,
): Promise<ChatMessagesPage> {
  const parametres = new URLSearchParams();

  if (cursor) parametres.set('cursor', cursor);

  const requete = parametres.toString();

  const response = await fetch(
    requete
      ? `${API_URL}/chats/${chatId}/messages?${requete}`
      : `${API_URL}/chats/${chatId}/messages`,
    {
      headers: entetes(token),
      cache: 'no-store',
    },
  );

  const page: ChatMessagesPage = await lireReponse(response);

  return { ...page, messages: page.messages.map(normaliserMessage) };
}

export async function sendMessage(
  token: string,
  chatId: string,
  content: string,
): Promise<ChatMessages> {
  const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { ...entetes(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  return normaliserMessage(await lireReponse(response));
}

export async function markChatAsRead(
  token: string,
  chatId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/chats/${chatId}/read`, {
    method: 'PATCH',
    headers: entetes(token),
  });

  await lireReponse(response);
}

export async function getUnreadCount(
  token: string,
): Promise<UnreadMessagesCount> {
  const response = await fetch(`${API_URL}/chats/unread-count`, {
    headers: entetes(token),
    cache: 'no-store',
  });

  return lireReponse(response);
}
