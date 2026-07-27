const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

export type ChatUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export type ChatItem = {
  id: string;
  matchId: string;
  user: ChatUser | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ChatUser;
};

async function parseResponse(
  response: Response,
) {
  const data = await response.json();

  if (!response.ok) {
    const message =
      Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message;

    throw new Error(
      message ?? 'Une erreur est survenue',
    );
  }

  return data;
}

export async function getChatsApi(
  token: string,
): Promise<ChatItem[]> {
  const response = await fetch(
    `${API_URL}/chats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return parseResponse(response);
}

export async function getMessagesApi(
  token: string,
  chatId: string,
): Promise<ChatMessage[]> {
  const response = await fetch(
    `${API_URL}/chats/${chatId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return parseResponse(response);
}

export async function sendMessageApi(
  token: string,
  chatId: string,
  content: string,
): Promise<ChatMessage> {
  const response = await fetch(
    `${API_URL}/chats/${chatId}/messages`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        content,
      }),
    },
  );

  return parseResponse(response);
}