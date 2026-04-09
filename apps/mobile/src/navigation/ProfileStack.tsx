import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './type/profileStack';
import { ProfileScreen } from 'src/profile/ui/ProfileScreen';
import { View, Text } from 'react-native';
import { ProfilePublicScreen } from 'src/profile/ui/ProfilePublicScreen';
import { SettingsScreen } from 'src/profile/ui/SettingsScreen';
import { PreferencesScreen } from 'src/profile/ui/PreferencesScreen';
import { FavoritesScreen } from 'src/profile/ui/favorite/FavoritesScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

function TestScreen() {
  return (
    <View>
      <Text>Test</Text>
    </View>
  );
}

type Props = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ProfileStackNavigator({ setIsAuthenticated }: Props) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={(props: NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>) =>
          <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />
        }
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PublicProfile"
        component={ProfilePublicScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={TestScreen}
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
    </Stack.Navigator>
  );
}