import AsyncStorage from '@react-native-async-storage/async-storage';
import { DestinationSuggestion } from './mapboxSearch.api';

const RECENT_DESTINATIONS_KEY = 'wim.recent-destinations';
const MAX_RECENT_DESTINATIONS = 5;

export async function getRecentDestinations(): Promise<
  DestinationSuggestion[]
> {
  try {
    const storedValue = await AsyncStorage.getItem(
      RECENT_DESTINATIONS_KEY,
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.log('Recent destinations read error:', error);
    return [];
  }
}

export async function saveRecentDestination(
  destination: DestinationSuggestion,
): Promise<DestinationSuggestion[]> {
  try {
    const currentDestinations =
      await getRecentDestinations();

    const destinationsWithoutDuplicate =
      currentDestinations.filter(
        (item) => item.id !== destination.id,
      );

    const updatedDestinations = [
      destination,
      ...destinationsWithoutDuplicate,
    ].slice(0, MAX_RECENT_DESTINATIONS);

    await AsyncStorage.setItem(
      RECENT_DESTINATIONS_KEY,
      JSON.stringify(updatedDestinations),
    );

    return updatedDestinations;
  } catch (error) {
    console.log('Recent destination save error:', error);
    return [];
  }
}

export async function clearRecentDestinations(): Promise<void> {
  await AsyncStorage.removeItem(
    RECENT_DESTINATIONS_KEY,
  );
}