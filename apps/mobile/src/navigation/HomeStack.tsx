import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeCreationProvider } from 'src/home/context/homeCreation.context';
import { HomesStackParamList } from './type/homeStack';
import { View, Text } from 'react-native';
import { HomeDetailsScreen } from 'src/home/ui/HomeDetailScreen';
import { EditHomeScreen } from 'src/home/ui/EditHomeScreen';
import { ExchangeAvailabilityScreen } from 'src/home/ui/ExchangeAvailabilityScreen';
import { ExchangeMessageScreen } from 'src/home/ui/ExchangeMessageScreen';

const Stack = createNativeStackNavigator<HomesStackParamList>();

function TestScreen() {
  return (
    <View>
      <Text>Test</Text>
    </View>
  );
}

export function HomesStackNavigator() {
  return (
    <HomeCreationProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MyHomes" component={TestScreen} />
        <Stack.Screen name="HomeDetails" component={HomeDetailsScreen} />
        <Stack.Screen name="CreateHomePhotos" component={TestScreen} />
        <Stack.Screen name="CreateHomeDescription" component={TestScreen} />
        <Stack.Screen name="CreateHomeLocation" component={TestScreen} />
        <Stack.Screen name="CreateHomeCapacity" component={TestScreen} />
        <Stack.Screen name="EditHome" component={EditHomeScreen} />
        <Stack.Screen name="ExchangeAvailability" component={ExchangeAvailabilityScreen} />
        <Stack.Screen name="ExchangeMessage" component={ExchangeMessageScreen} />
      </Stack.Navigator>
    </HomeCreationProvider>
  );
}