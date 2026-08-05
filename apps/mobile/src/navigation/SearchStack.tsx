import { createStackNavigator } from "@react-navigation/stack";
import { DestinationSearchScreen } from "src/search/ui/DestinationSearchScreen";
import { SearchScreen } from "src/search/ui/SearchScreen";
import { SearchStackParamList } from "./type/searchTabs";
import { View, Text } from 'react-native';
import { SearchResultsScreen } from "src/search/ui/SearchResultsScreen";
import { MenuScreen } from "src/menu/ui/MenuScreen";
import { HomeDetailsScreen } from "src/home/ui/HomeDetailScreen";
import { ProfilePublicScreen } from 'src/profile/ui/ProfilePublicScreen';
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

export function SearchStackNavigator() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="DestinationSearch" component={DestinationSearchScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          <Stack.Screen name="Swipe" component={SwipeHomeScreen} />
          <Stack.Screen name="HomeDetails" component={HomeDetailsScreen} />
        <Stack.Screen name="PublicProfile" component={ProfilePublicScreen} />
          <Stack.Screen name="SwipeHomeDetails" component={SwipeDetailHomeScreen} />
        </Stack.Navigator>
    );
}