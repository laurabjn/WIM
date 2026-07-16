import Mapbox from '@rnmapbox/maps';

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

if (!mapboxToken) {
  throw new Error(
    'EXPO_PUBLIC_MAPBOX_TOKEN est absente. Vérifie le fichier .env.',
  );
}

Mapbox.setAccessToken(mapboxToken);

export { Mapbox };