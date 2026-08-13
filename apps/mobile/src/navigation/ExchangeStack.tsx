import { createStackNavigator } from '@react-navigation/stack';

import { ExchangesScreen } from 'src/home/ui/ExchangesScreen';
import { HomeDetailsScreen } from 'src/home/ui/HomeDetailScreen';
import { ProfilePublicScreen } from 'src/profile/ui/ProfilePublicScreen';

export type ExchangeStackParamList = {
  Exchanges: undefined;
  HomeDetails: { homeId: string };
  PublicProfile: { userId: string };
};

const Stack = createStackNavigator<ExchangeStackParamList>();

// Sans pile propre, l'onglet Echanges empruntait celle d'un autre onglet pour
// afficher un logement : le retour ramenait alors sur le profil.
export function ExchangeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Exchanges" component={ExchangesScreen} />
      <Stack.Screen name="HomeDetails" component={HomeDetailsScreen} />
      <Stack.Screen name="PublicProfile" component={ProfilePublicScreen} />
    </Stack.Navigator>
  );
}
