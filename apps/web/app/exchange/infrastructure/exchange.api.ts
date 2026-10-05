import type { Exchange, PendingExchange } from '@wim/shared';

import { API_URL, SERVER_URL } from 'app/home/infrastructure/api';

export type StayToReview = {
  exchangeId: string;
  homeId: string;
  homeTitle: string;
  homePhotoUrl: string | null;
  partnerFirstName: string;
  startDate: string;
  endDate: string;
};

function resoudreFichier(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;

  return `${SERVER_URL}${url}`;
}

function normaliserEchange(echange: Exchange): Exchange {
  return {
    ...echange,
    homeImageUrl: resoudreFichier(echange.homeImageUrl),
    guestHomeImageUrl: resoudreFichier(echange.guestHomeImageUrl),
    partner: echange.partner
      ? {
          ...echange.partner,
          avatarUrl: resoudreFichier(echange.partner.avatarUrl),
        }
      : null,
  };
}

export class ErreurApi extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function lireReponse(response: Response) {
  const brut = await response.text();
  const data = brut ? JSON.parse(brut) : null;

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;

    throw new ErreurApi(message ?? 'Une erreur est survenue', data?.code);
  }

  return data;
}

function entetes(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getMyExchanges(token: string): Promise<Exchange[]> {
  const response = await fetch(`${API_URL}/exchanges/me`, {
    headers: entetes(token),
    cache: 'no-store',
  });

  const data: Exchange[] = await lireReponse(response);

  return data.map(normaliserEchange);
}

export async function getStaysToReview(
  token: string,
): Promise<StayToReview[]> {
  const response = await fetch(`${API_URL}/exchanges/stays-to-review`, {
    headers: entetes(token),
    cache: 'no-store',
  });

  const data: StayToReview[] = await lireReponse(response);

  return data.map((sejour) => ({
    ...sejour,
    homePhotoUrl: resoudreFichier(sejour.homePhotoUrl),
  }));
}

export async function reviewStay(
  token: string,
  exchangeId: string,
  score: number,
  comment: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/exchanges/${exchangeId}/review`, {
    method: 'POST',
    headers: { ...entetes(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, comment }),
  });

  await lireReponse(response);
}

export async function requestExchange(
  token: string,
  demande: {
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
    headers: { ...entetes(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(demande),
  });

  return lireReponse(response);
}

export type LogementCandidat = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export async function getChatExchange(
  token: string,
  chatId: string,
): Promise<PendingExchange | null> {
  const response = await fetch(`${API_URL}/exchanges/chat/${chatId}`, {
    headers: entetes(token),
    cache: 'no-store',
  });

  const data: PendingExchange | null = await lireReponse(response);

  if (!data) return null;

  return {
    ...data,
    homeImageUrl: resoudreFichier(data.homeImageUrl),
    guestHomeImageUrl: resoudreFichier(data.guestHomeImageUrl),
  };
}

export async function fetchGuestHomes(
  token: string,
  exchangeId: string,
): Promise<LogementCandidat[]> {
  const response = await fetch(
    `${API_URL}/exchanges/${exchangeId}/guest-homes`,
    { headers: entetes(token), cache: 'no-store' },
  );

  if (!response.ok) return [];

  const data: LogementCandidat[] = await response.json().catch(() => []);

  return data.map((candidat) => ({
    ...candidat,
    imageUrl: resoudreFichier(candidat.imageUrl),
  }));
}

export async function respondToExchange(
  token: string,
  exchangeId: string,
  reponse: 'ACCEPT' | 'DECLINE',
  guestHomeId?: string,
): Promise<PendingExchange> {
  const response = await fetch(`${API_URL}/exchanges/${exchangeId}/respond`, {
    method: 'PATCH',
    headers: { ...entetes(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ response: reponse, guestHomeId }),
  });

  return lireReponse(response);
}

export async function cancelExchange(
  token: string,
  exchangeId: string,
): Promise<PendingExchange> {
  const response = await fetch(`${API_URL}/exchanges/${exchangeId}/cancel`, {
    method: 'PATCH',
    headers: entetes(token),
  });

  return lireReponse(response);
}
