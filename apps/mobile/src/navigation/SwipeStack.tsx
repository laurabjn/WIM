import { createStackNavigator } from "@react-navigation/stack";
import { SearchStackParamList } from "./type/searchTabs";
import { View, Text } from 'react-native';
import { MenuScreen } from "src/menu/ui/MenuScreen";
import { SwipeDetailHomeScreen } from "src/swipe/ui/components/SwipeDetailsHomeScreen";
import { SwipeHomeScreen } from "src/swipe/ui/SwipeHomeScreen";
import { ProfilePublicScreen } from "src/profile/ui/ProfilePublicScreen";
import { FONDU_ENCHAINE } from "./transitions";

const Stack = createStackNavigator<SearchStackParamList>();

function TestScreen() {
  return (
    <View>
      <Text>Test</Text>
    </View>
  );
}

export function SwipeStackNavigator() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen
            name="Swipe"
            component={SwipeHomeScreen}
            options={FONDU_ENCHAINE}
          />
          <Stack.Screen name="SwipeHomeDetails" component={SwipeDetailHomeScreen} />
          <Stack.Screen name="PublicProfile" component={ProfilePublicScreen} />
        </Stack.Navigator>
    );
}