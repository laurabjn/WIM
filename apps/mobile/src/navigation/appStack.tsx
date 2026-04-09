import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileScreen } from 'src/profile/ui/ProfileScreen';

export type AppStackParamList = {
  Profile: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

export const AppStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};