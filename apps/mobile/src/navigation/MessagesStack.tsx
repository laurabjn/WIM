import { createStackNavigator } from '@react-navigation/stack';

import { ConversationsScreen } from 'src/chat/ui/ConversationsScreen';
import { ConversationScreen } from 'src/chat/ui/ConversationScreen';
import { MatchesScreen } from 'src/chat/ui/MatchesScreen';
import { RequestsScreen } from 'src/chat/ui/RequestsScreen';
import { ProfilePublicScreen } from 'src/profile/ui/ProfilePublicScreen';
import { HomeDetailsScreen } from 'src/home/ui/HomeDetailScreen';

export type MessagesStackParamList = {
  Conversations: undefined;
  Conversation: {
    chatId: string;
    participantId?: string;
    participantName?: string;
    participantAvatar?: string | null;
  };
  Requests: undefined;
  Matches: undefined;
  PublicProfile: { userId: string };
  HomeDetails: { homeId: string };
};

const Stack = createStackNavigator<MessagesStackParamList>();

export function MessagesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="Requests" component={RequestsScreen} />
      <Stack.Screen name="Matches" component={MatchesScreen} />
      <Stack.Screen name="PublicProfile" component={ProfilePublicScreen} />
      <Stack.Screen name="HomeDetails" component={HomeDetailsScreen} />
    </Stack.Navigator>
  );
}
