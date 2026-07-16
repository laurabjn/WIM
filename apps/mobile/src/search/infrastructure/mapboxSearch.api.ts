const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export type DestinationSuggestion = {
  id: string;
  name: string;
  fullName: string;
  city: string;
  country: string;
  longitude: number;
  latitude: number;
};

type MapboxFeature = {
  id: string;
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    full_address?: string;
    place_formatted?: string;
    coordinates?: {
      longitude?: number;
      latitude?: number;
    };
    context?: {
      place?: {
        name?: string;
      };
      country?: {
        name?: string;
      };
    };
  };
};

type MapboxResponse = {
  features?: MapboxFeature[];
};

export async function searchDestinationsApi(
  query: string,
  language = 'fr',
): Promise<DestinationSuggestion[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  if (!MAPBOX_TOKEN) {
    throw new Error('EXPO_PUBLIC_MAPBOX_TOKEN est manquant');
  }

  const params = new URLSearchParams({
    q: normalizedQuery,
    access_token: MAPBOX_TOKEN,
    language,
    types: 'place',
    limit: '6',
  });

  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`,
  );

  console.log(response)
    
  const data = (await response.json().catch(() => null)) as
    | MapboxResponse
    | null;

  if (!response.ok) {
    throw new Error('Impossible de rechercher les destinations');
  }

  return (data?.features ?? [])
    .map((feature): DestinationSuggestion | null => {
      const longitude =
        feature.properties?.coordinates?.longitude ??
        feature.geometry?.coordinates?.[0];

      const latitude =
        feature.properties?.coordinates?.latitude ??
        feature.geometry?.coordinates?.[1];

      if (
        typeof longitude !== 'number' ||
        typeof latitude !== 'number'
      ) {
        return null;
      }

      const city =
        feature.properties?.context?.place?.name ??
        feature.properties?.name ??
        '';

      const country =
        feature.properties?.context?.country?.name ?? '';

      const fullName =
        feature.properties?.full_address ??
        feature.properties?.place_formatted ??
        [city, country].filter(Boolean).join(', ');

      return {
        id: feature.id,
        name: feature.properties?.name ?? city,
        fullName,
        city,
        country,
        longitude,
        latitude,
      };
    })
    .filter(
      (
        suggestion,
      ): suggestion is DestinationSuggestion =>
        suggestion !== null,
    );
}