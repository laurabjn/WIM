import { API_URL } from '../../config/api';

export type MatchUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  country: string | null;
};

export type UserMatch = {
  id: string;
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'BLOCKED';

  createdAt: string;
  user: MatchUser;
};

export async function getMyMatchesApi(
  token: string,
): Promise<UserMatch[]> {
  const response = await fetch(
    `${API_URL}/matches/me`,
    {
      method: 'GET',

      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message;

    throw new Error(
      message ??
        'Impossible de récupérer les matchs',
    );
  }

  return data as UserMatch[];
}