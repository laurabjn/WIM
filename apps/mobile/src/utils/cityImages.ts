import { API_URL } from 'src/config/api';
import { getSession } from 'src/auth/infrastructure/authStorage';

export type ImageDeVille = { id: string; url: string; grande: string };

export async function getCityImagesApi(
  city: string,
  country: string,
  nombre = 3,
): Promise<ImageDeVille[]> {
  if (!city?.trim()) return [];

  try {
    const session = await getSession();

    if (!session?.accessToken) return [];

    const parametres = new URLSearchParams({
      country: country ?? '',
      count: String(nombre),
    });

    const response = await fetch(
      `${API_URL}/locations/${encodeURIComponent(city)}/images?${parametres}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { images?: ImageDeVille[] };

    return data.images ?? [];
  } catch {
    return [];
  }
}
