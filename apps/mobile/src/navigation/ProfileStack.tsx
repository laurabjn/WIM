import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './type/profileStack';
import { ProfileScreen } from 'src/profile/ui/ProfileScreen';
import { View, Text } from 'react-native';
import { ProfilePublicScreen } from 'src/profile/ui/ProfilePublicScreen';
import { SettingsScreen } from 'src/profile/ui/SettingsScreen';
import { PreferencesScreen } from 'src/profile/ui/PreferencesScreen';
import { FavoritesScreen } from 'src/home/ui/FavoritesScreen';
import { EditProfileScreen } from 'src/profile/ui/EditProfileScreen';
import { HelpScreen } from 'src/profile/ui/HelpScreen';
import { RegionDestinationsScreen } from 'src/profile/ui/RegionDestinationsScreen';
import { HomeDetailsScreen } from 'src/home/ui/HomeDetailScreen';
import { EditHomeScreen } from 'src/home/ui/EditHomeScreen';
import { SupportScreen } from 'src/profile/ui/SupportScreen';
import { BlockedUsersScreen } from 'src/profile/ui/BlockedUsersScreen';
import { ExchangeAvailabilityScreen } from 'src/home/ui/ExchangeAvailabilityScreen';
import { ExchangeMessageScreen } from 'src/home/ui/ExchangeMessageScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

type Props = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ProfileStackNavigator({ setIsAuthenticated }: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        options={{ headerShown: false }}
      >
        {(props: NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>) => (
          <ProfileScreen
            {...props}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="PublicProfile"
        component={ProfilePublicScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegionDestinations"
        component={RegionDestinationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeDetails"
        component={HomeDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditHome"
        component={EditHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExchangeAvailability"
        component={ExchangeAvailabilityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExchangeMessage"
        component={ExchangeMessageScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}