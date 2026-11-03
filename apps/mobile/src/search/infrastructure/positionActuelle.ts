import * as Location from 'expo-location';
import type { DestinationSuggestion } from './mapboxSearch.api';

export const ID_POSITION_ACTUELLE = 'position-actuelle';

export async function destinationAutourDeMoi(): Promise<DestinationSuggestion | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });

    const [adresse] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const ville = adresse?.city ?? adresse?.subregion ?? adresse?.region;

    if (!ville) return null;

    const pays = adresse?.country ?? '';

    return {
      id: ID_POSITION_ACTUELLE,
      name: ville,
      fullName: [ville, pays].filter(Boolean).join(', '),
      city: ville,
      country: pays,
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
    };
  } catch {
    return null;
  }
}
