import { createStackNavigator } from "@react-navigation/stack";
import { DestinationSearchScreen } from "src/search/ui/DestinationSearchScreen";
import { SearchScreen } from "src/search/ui/SearchScreen";
import { SearchStackParamList } from "./type/searchTabs";
import { View, Text } from 'react-native';
import { SearchResultsScreen } from "src/search/ui/SearchResultsScreen";
import { SwipeHomeScreen } from "src/swipe/infrastructure/SwipeHomeScreen";
import { MenuScreen } from "src/menu/ui/MenuScreen";
import { HomeDetailsScreen } from "src/home/ui/HomeDetailScreen";

const Stack = createStackNavigator<SearchStackParamList>();

function TestScreen() {
  return (
    <View>
      <Text>Test</Text>
    </View>
  );
}

export function SearchStackNavigator() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="DestinationSearch" component={DestinationSearchScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          <Stack.Screen name="Swipe" component={SwipeHomeScreen} />
          <Stack.Screen name="HomeDetails" component={HomeDetailsScreen} />
        </Stack.Navigator>
    );
}