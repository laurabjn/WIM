import { createStackNavigator } from '@react-navigation/stack';

import { SearchScreen } from 'src/search/ui/SearchScreen';
import { DestinationSearchScreen } from 'src/search/ui/DestinationSearchScreen';
import { SearchResultsScreen } from 'src/search/ui/SearchResultsScreen';
import { HomeDetailsScreen } from 'src/home/ui/HomeDetailScreen';
import { ProfilePublicScreen } from 'src/profile/ui/ProfilePublicScreen';

import { SearchStackParamList } from './type/searchTabs';

const Stack = createStackNavigator<SearchStackParamList>();

export function SearchOnlyStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen
        name="Search"
        component={SearchScreen}
      />

      <Stack.Screen
        name="DestinationSearch"
        component={DestinationSearchScreen}
      />

      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
      />

      {/* Sans ces deux ecrans, React Navigation les cherchait dans l'onglet
          Accueil : ouvrir un resultat basculait d'onglet, et le retour
          ramenait au menu au lieu des resultats. */}
      <Stack.Screen
        name="HomeDetails"
        component={HomeDetailsScreen}
      />

      <Stack.Screen
        name="PublicProfile"
        component={ProfilePublicScreen}
      />

    </Stack.Navigator>
  );
}