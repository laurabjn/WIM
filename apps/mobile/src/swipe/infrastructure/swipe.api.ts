import { API_URL } from '../../config/api';

export type SwipeDirection = 'LIKE' | 'DISLIKE';

export type LogementAime = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export async function fetchLikedHomesApi(
  token: string,
  ownerId: string,
): Promise<LogementAime[]> {
  const response = await fetch(
    `${API_URL}/swipes/liked-homes?ownerId=${encodeURIComponent(ownerId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) return [];

  return (await response.json().catch(() => [])) as LogementAime[];
}

export type SwipeResponse = {
  success: boolean;
  match: boolean;
  matchId: string | null;
};

export type SwipeApiResult = {
  swipe: {
    id: string;
    swiperId: string;
    targetUserId: string;
    homeId: string;
    direction: SwipeDirection;
    createdAt: string;
  };

  match: boolean;
  matchId: string | null;
  chatId?: string | null;
  autreLogementDejaLike?: boolean;
};

export type SwipeRecommendation = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  homeType: string;
  amenities: string[];
  carExchangeAccepted: boolean;

  photos: Array<{
    id: string;
    url: string;
    position: number;
  }>;

  beds?: number;
  bedrooms?: number;
  bathrooms?: number;
  averageRating?: number | null;
  reviewsCount?: number;

  owner?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };

  recommendationScore?: number;
};

export async function getSwipeRecommendationsApi(
  accessToken: string,
  limit = 20,
): Promise<SwipeRecommendation[]> {
  const response = await fetch(
    `${API_URL}/swipes/recommendations?limit=${limit}`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Recommendation error ${response.status}: ${body}`,
    );
  }

  const data = await response.json();

  return data.results;
}

export async function createSwipeApi(
  token: string,
  targetUserId: string,
  homeId: string,
  direction: SwipeDirection,
): Promise<SwipeApiResult> {
  const response = await fetch(
    `${API_URL}/swipes`,
    {
      method: 'POST',

      headers: {
        Authorization:
          `Bearer ${token}`,
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        targetUserId,
        homeId,
        direction,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Swipe error ${response.status}: ${body}`,
    );
  }

  return response.json();
}