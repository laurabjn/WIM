import { API_URL } from 'src/config/api';

export type ReviewView = {
  id: string;
  score: number;
  comment: string;
  createdAt: string;
  reply: string | null;
  replyAt: string | null;
  homeId: string;
  homeTitle: string;
  author: {
    id: string;
    firstName: string | null;
    avatarUrl: string | null;
  };
};

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function lire(response: Response) {
  const brut = await response.text();

  if (!response.ok) {
    let message = 'Une erreur est survenue';

    try {
      const corps = brut ? JSON.parse(brut) : null;

      if (corps?.message) {
        message = Array.isArray(corps.message)
          ? corps.message.join(', ')
          : corps.message;
      }
    } catch {
      message = 'Une erreur est survenue';
    }

    throw new Error(message);
  }

  return brut ? JSON.parse(brut) : null;
}

export async function getHomeReviewsApi(
  token: string,
  homeId: string,
  cursor?: string | null,
): Promise<{ reviews: ReviewView[]; nextCursor: string | null }> {
  const response = await fetch(
    `${API_URL}/reviews/home/${homeId}${cursor ? `?cursor=${cursor}` : ''}`,
    { headers: authHeaders(token) },
  );

  return lire(response);
}

export async function getUserReviewsApi(
  token: string,
  userId: string,
): Promise<ReviewView[]> {
  const response = await fetch(`${API_URL}/reviews/user/${userId}`, {
    headers: authHeaders(token),
  });

  return lire(response);
}

export async function updateReviewApi(
  token: string,
  reviewId: string,
  score: number,
  comment: string,
): Promise<ReviewView> {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ score, comment }),
  });

  return lire(response);
}

export async function deleteReviewApi(
  token: string,
  reviewId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  await lire(response);
}

export async function replyToReviewApi(
  token: string,
  reviewId: string,
  reply: string,
): Promise<ReviewView> {
  const response = await fetch(`${API_URL}/reviews/${reviewId}/reply`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reply }),
  });

  return lire(response);
}

export async function reportReviewApi(
  token: string,
  reviewId: string,
  reason: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/reviews/${reviewId}/report`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });

  await lire(response);
}
