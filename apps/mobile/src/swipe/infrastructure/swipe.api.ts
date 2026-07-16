const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

export type SwipeDirection = 'LIKE' | 'DISLIKE';

export type SwipeResponse = {
  success: boolean;
  match: boolean;
  matchId: string | null;
};

export async function createSwipeApi(
  token: string,
  targetUserId: string,
  direction: SwipeDirection,
): Promise<SwipeResponse> {
  const response = await fetch(`${API_URL}/swipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      targetUserId,
      direction,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? 'Erreur lors du swipe');
  }

  return data;
}