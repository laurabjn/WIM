import { createStackNavigator } from '@react-navigation/stack';

import { ConversationsScreen } from 'src/chat/ui/ConversationsScreen';
import { ConversationScreen } from 'src/chat/ui/ConversationScreen';

export type MessagesStackParamList = {
  Conversations: undefined;
  Conversation: {
    chatId: string;
    participantName?: string;
    participantAvatar?: string | null;
  };
};

const Stack = createStackNavigator<MessagesStackParamList>();

export function MessagesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
}
