const UNSPLASH_ACCESS_KEY = 't_hMb8hidPrr-1MDKOzTY5v6FY36k3Xh9iVOaQ_TtO0';

export async function getCityImagesApi(city: string, country: string) {
  const query = encodeURIComponent(`${city} travel`);

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=3&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok || !data.results?.length) {
    const fallbackQuery = encodeURIComponent(country);

    const fallbackResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${fallbackQuery}&per_page=3&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      },
    );

    const fallbackData = await fallbackResponse.json();

    return fallbackData.results.map((image: any) => ({
      id: image.id,
      url: image.urls.small,
    }));
  }

  return data.results.map((image: any) => ({
    id: image.id,
    url: image.urls.small,
  }));
}