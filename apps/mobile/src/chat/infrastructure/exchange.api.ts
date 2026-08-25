import { API_URL } from '../../config/api';
import type { PendingExchange } from '@wim/shared';

async function parseOptional(response: Response) {
  const raw = await response.text();

  if (!response.ok) {
    // L'API explique pourquoi elle refuse : le taire priverait l'ecran du seul
    // message utile a montrer.
    let message = 'Une erreur est survenue';

    try {
      const body = raw ? JSON.parse(raw) : null;

      if (body?.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
    } catch {
      // Corps non lisible : on garde le message generique.
    }

    throw new Error(message);
  }

  if (!raw) return null;

  return JSON.parse(raw);
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export type StayToReview = {
  exchangeId: string;
  homeId: string;
  homeTitle: string;
  homePhotoUrl: string | null;
  partnerFirstName: string;
  startDate: string;
  endDate: string;
};

export async function getStaysToReviewApi(
  token: string,
): Promise<StayToReview[]> {
  const response = await fetch(`${API_URL}/exchanges/stays-to-review`, {
    headers: authHeaders(token),
  });

  if (!response.ok) throw new Error('Le chargement des séjours a échoué');

  return response.json();
}

export async function reviewStayApi(
  token: string,
  exchangeId: string,
  score: number,
  comment: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/exchanges/${exchangeId}/review`,
    {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, comment }),
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message ?? 'La note n’a pas pu être enregistrée',
    );
  }
}

export async function getChatExchangeApi(
  token: string,
  chatId: string,
): Promise<PendingExchange | null> {
  const response = await fetch(`${API_URL}/exchanges/chat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return parseOptional(response);
}

export type LogementCandidat = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export async function fetchGuestHomesApi(
  token: string,
  exchangeId: string,
): Promise<LogementCandidat[]> {
  const result = await fetch(
    `${API_URL}/exchanges/${exchangeId}/guest-homes`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!result.ok) return [];

  return (await result.json().catch(() => [])) as LogementCandidat[];
}

export async function respondToExchangeApi(
  token: string,
  exchangeId: string,
  response: 'ACCEPT' | 'DECLINE',
  guestHomeId?: string,
): Promise<PendingExchange> {
  const result = await fetch(`${API_URL}/exchanges/${exchangeId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ response, guestHomeId }),
  });

  return parseOptional(result);
}

export async function cancelExchangeApi(
  token: string,
  exchangeId: string,
): Promise<PendingExchange> {
  const result = await fetch(`${API_URL}/exchanges/${exchangeId}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseOptional(result);
}

export async function requestExchangeApi(
  token: string,
  input: {
    homeId: string;
    guestHomeId?: string;
    message: string;
    startDate?: string;
    endDate?: string;
    travelersCount?: number;
  },
): Promise<{ exchangeId: string; chatId: string }> {
  const response = await fetch(`${API_URL}/exchanges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  return parseOptional(response);
}

export async function updateExchangeDatesApi(
  token: string,
  exchangeId: string,
  startDate: string,
  endDate: string,
): Promise<PendingExchange> {
  const response = await fetch(`${API_URL}/exchanges/${exchangeId}/dates`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ startDate, endDate }),
  });

  return parseOptional(response);
}
