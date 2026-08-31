// La cle vit dans l'environnement : embarquee dans le code, elle part avec le
// depot et se lit dans le bundle.
const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ?? '';

export type ImageDeVille = { id: string; url: string; grande: string };

async function chercher(
  requete: string,
  nombre: number,
): Promise<ImageDeVille[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      requete,
    )}&per_page=${nombre}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.results?.length) return [];

  return data.results.map((image: any) => ({
    id: image.id,
    url: image.urls.small,
    grande: image.urls.regular,
  }));
}

export async function getCityImagesApi(
  city: string,
  country: string,
  nombre = 3,
): Promise<ImageDeVille[]> {
  const villes = await chercher(`${city} travel`, nombre);

  if (villes.length > 0) return villes;

  // Une ville inconnue d'Unsplash reste dans son pays : mieux vaut un paysage
  // approchant qu'un cadre vide.
  return chercher(country, nombre);
}
