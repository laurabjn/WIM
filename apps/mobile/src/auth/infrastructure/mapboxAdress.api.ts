const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export type AddressSuggestion = {
  mapboxId: string;
  name: string;
  fullAddress: string;
};

export type SelectedAddress = {
  mapboxId: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
};

type MapboxSuggestResponse = {
  suggestions?: Array<{
    mapbox_id: string;
    name?: string;
    full_address?: string;
    place_formatted?: string;
  }>;
};

type MapboxRetrieveResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      mapbox_id?: string;
      name?: string;
      full_address?: string;
      place_formatted?: string;
      address?: string;
      context?: {
        place?: {
          name?: string;
        };
        postcode?: {
          name?: string;
        };
        country?: {
          name?: string;
        };
      };
      coordinates?: {
        longitude?: number;
        latitude?: number;
      };
    };
  }>;
};

function requireMapboxToken(): string {
  if (!MAPBOX_TOKEN) {
    throw new Error('EXPO_PUBLIC_MAPBOX_TOKEN est manquant');
  }

  return MAPBOX_TOKEN;
}

export async function suggestAddressesApi(
  query: string,
  sessionToken: string,
): Promise<AddressSuggestion[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: normalizedQuery,
    access_token: requireMapboxToken(),
    session_token: sessionToken,
    language: 'fr',
    limit: '6',
    types: 'address',
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`,
  );

  const data = (await response.json().catch(() => null)) as
    | MapboxSuggestResponse
    | null;

  if (!response.ok) {
    throw new Error(
      `Mapbox address suggestions failed: ${response.status}`,
    );
  }

  return (data?.suggestions ?? []).map((suggestion) => ({
    mapboxId: suggestion.mapbox_id,
    name: suggestion.name ?? '',
    fullAddress:
      suggestion.full_address ??
      suggestion.place_formatted ??
      suggestion.name ??
      '',
  }));
}

export async function retrieveAddressApi(
  mapboxId: string,
  sessionToken: string,
): Promise<SelectedAddress> {
  const params = new URLSearchParams({
    access_token: requireMapboxToken(),
    session_token: sessionToken,
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
      mapboxId,
    )}?${params.toString()}`,
  );

  const data = (await response.json().catch(() => null)) as
    | MapboxRetrieveResponse
    | null;

  if (!response.ok) {
    throw new Error(
      `Mapbox address retrieve failed: ${response.status}`,
    );
  }

  const feature = data?.features?.[0];
  const properties = feature?.properties;

  const longitude =
    properties?.coordinates?.longitude ??
    feature?.geometry?.coordinates?.[0];

  const latitude =
    properties?.coordinates?.latitude ??
    feature?.geometry?.coordinates?.[1];

  if (
    typeof longitude !== 'number' ||
    typeof latitude !== 'number'
  ) {
    throw new Error(
      'Les coordonnées de cette adresse sont indisponibles.',
    );
  }

  const city = properties?.context?.place?.name ?? '';
  const country = properties?.context?.country?.name ?? '';
  const postalCode = properties?.context?.postcode?.name ?? '';

  const fullAddress =
    properties?.full_address ??
    properties?.place_formatted ??
    [properties?.name, postalCode, city, country]
      .filter(Boolean)
      .join(', ');

  return {
    mapboxId: properties?.mapbox_id ?? mapboxId,
    address:
      properties?.address ??
      properties?.name ??
      fullAddress,
    city,
    country,
    postalCode,
    longitude,
    latitude,
    fullAddress,
  };
}