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

export async function getChatExchangeApi(
  token: string,
  chatId: string,
): Promise<PendingExchange | null> {
  const response = await fetch(`${API_URL}/exchanges/chat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return parseOptional(response);
}

export async function respondToExchangeApi(
  token: string,
  exchangeId: string,
  response: 'ACCEPT' | 'DECLINE',
): Promise<PendingExchange> {
  const result = await fetch(`${API_URL}/exchanges/${exchangeId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ response }),
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
