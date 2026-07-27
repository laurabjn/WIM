import { createStackNavigator } from "@react-navigation/stack";
import { SearchStackParamList } from "./type/searchTabs";
import { View, Text } from 'react-native';
import { MenuScreen } from "src/menu/ui/MenuScreen";
import { SwipeDetailHomeScreen } from "src/swipe/ui/components/SwipeDetailsHomeScreen";
import { SwipeHomeScreen } from "src/swipe/ui/SwipeHomeScreen";

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
          <Stack.Screen name="Swipe" component={SwipeHomeScreen} />
          <Stack.Screen name="SwipeHomeDetails" component={SwipeDetailHomeScreen} />
        </Stack.Navigator>
    );
}