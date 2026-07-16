const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.34:3002/api';

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
): Promise<LocationDescription | null> {
  const params = new URLSearchParams({
    language,
  });

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