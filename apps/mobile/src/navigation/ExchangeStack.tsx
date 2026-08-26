import { createStackNavigator } from '@react-navigation/stack';
import { ReviewStayScreen } from 'src/home/ui/ReviewStayScreen';

import { ExchangesScreen } from 'src/home/ui/ExchangesScreen';
import { HomeDetailsScreen } from 'src/home/ui/HomeDetailScreen';
import { ProfilePublicScreen } from 'src/profile/ui/ProfilePublicScreen';
import { ConversationScreen } from 'src/chat/ui/ConversationScreen';
import { ExchangeAvailabilityScreen } from 'src/home/ui/ExchangeAvailabilityScreen';
import { ExchangeMessageScreen } from 'src/home/ui/ExchangeMessageScreen';

export type ExchangeStackParamList = {
  Exchanges: undefined;
  HomeDetails: { homeId: string };
  PublicProfile: { userId: string };
  Conversation: {
    chatId: string;
    participantId?: string;
    participantName?: string;
    participantAvatar?: string | null;
  };
  // Le menu de la conversation propose un echange : les ecrans du parcours
  // doivent exister ici aussi, sinon la navigation echouerait.
  ExchangeAvailability: { homeId: string };
  ReviewStay: {
    exchangeId: string;
    homeTitle: string;
    homePhotoUrl?: string | null;
    partnerFirstName?: string;
  };
  ExchangeMessage: {
    homeId: string;
    availabilityType: 'FREE' | 'EXCHANGER_DATES' | 'SPECIFIC_DATES';
    startDate?: string;
    endDate?: string;
  };
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
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen
        name="ExchangeAvailability"
        component={ExchangeAvailabilityScreen}
      />
      <Stack.Screen name="ReviewStay" component={ReviewStayScreen} />
      <Stack.Screen name="ExchangeMessage" component={ExchangeMessageScreen} />
    </Stack.Navigator>
  );
}
