import * as Location from 'expo-location';

export async function getCoordinatesFromAddress(address: string) {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      console.log('Permission refusée');
      return null;
    }

    const result = await Location.geocodeAsync(address);

    if (!result.length) return null;

    return {
      latitude: result[0].latitude,
      longitude: result[0].longitude,
    };
  } catch (error) {
    console.log('Geocoding error:', error);
    return null;
  }
}