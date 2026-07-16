export type LocationDescription = {
  title: string;
  description: string;
  extract: string;
  pageUrl?: string;
};

type WikipediaSummaryResponse = {
  title?: string;
  description?: string;
  extract?: string;
  content_urls?: {
    mobile?: {
      page?: string;
    };
    desktop?: {
      page?: string;
    };
  };
};

export async function getLocationDescription(
  city: string,
  language = 'fr',
): Promise<LocationDescription | null> {
  const normalizedCity = city.trim();

  if (!normalizedCity) {
    return null;
  }

  const encodedCity = encodeURIComponent(normalizedCity);

  const response = await fetch(
    `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodedCity}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  const data =
    (await response.json().catch(() => null)) as
      | WikipediaSummaryResponse
      | null;

  if (!response.ok || !data?.extract) {
    return null;
  }

  return {
    title: data.title ?? normalizedCity,
    description: data.description ?? '',
    extract: data.extract,
    pageUrl:
      data.content_urls?.mobile?.page ??
      data.content_urls?.desktop?.page,
  };
}