import type { Exchange } from '@wim/shared';

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
