const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export type DescriptionDeVille = {
  title: string;
  description: string;
  extract: string;
  pageUrl?: string;
};

export async function getDescriptionDeVille(
  city: string,
  country?: string | null,
  language = 'fr',
): Promise<DescriptionDeVille | null> {
  if (!city?.trim()) return null;

  const parametres = new URLSearchParams({ language });

  if (country) parametres.append('country', country);

  try {
    const response = await fetch(
      `${API_URL}/locations/${encodeURIComponent(city)}/description?${parametres}`,
      { next: { revalidate: 86400 } },
    );

    if (!response.ok) return null;

    return (await response.json()) as DescriptionDeVille | null;
  } catch {
    return null;
  }
}
