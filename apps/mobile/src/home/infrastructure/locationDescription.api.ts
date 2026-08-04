import { API_URL } from '../../config/api';

export type LocationDescription = {
  title: string;
  description: string;
  extract: string;
  pageUrl?: string;
};

export async function getLocationDescription(
  city: string,
  latitude?: number | null,
  longitude?: number | null,
  language = 'fr',
  country?: string | null,
): Promise<LocationDescription | null> {
  const params = new URLSearchParams({
    language,
  });

  // Départage les villes homonymes : « Valence » existe en France comme en
  // Espagne, et l'article Wikipédia générique est une page d'homonymie.
  if (country) {
    params.append('country', country);
  }

  if (typeof latitude === 'number') {
    params.append('latitude', String(latitude));
  }

  if (typeof longitude === 'number') {
    params.append('longitude', String(longitude));
  }

  const response = await fetch(
    `${API_URL}/locations/${encodeURIComponent(
      city,
    )}/description?${params.toString()}`,
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}