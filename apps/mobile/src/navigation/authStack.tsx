import React from 'react';
import { RegisterStartScreen } from '../auth/ui/Register/RegisterStartScreen';
import { RegisterStep1Screen } from '../auth/ui/Register/RegisterStep1Screen';
import { RegisterStep2Screen } from '../auth/ui/Register/RegisterStep2Screen';
import { RegisterIdentityScreen } from '../auth/ui/Register/RegisterIdentityScreen';
import { RegisterHousingScreen } from '../auth/ui/Register/RegisterHousingScreen';
import { RegisterWelcomeScreen } from '../auth/ui/Register/RegisterWelcomeScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { WelcomeEntryScreen } from '../auth/ui/WelcomeEntryScreen';
import { LoginScreen } from '../auth/ui/Login/LoginScreen';
import { ForgotPasswordScreen } from '../auth/ui/Login/ForgotPasswordScreen';

export type AuthStackParamList = {
  WelcomeEntry: undefined;
  RegisterStart: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  RegisterStep1: undefined;
  RegisterStep2: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    nationality: string;
    country: string;
    phone: string;
  };
  RegisterIdentity: { identityRedirectUrl?: string };
  RegisterHousing: undefined;
  RegisterWelcome: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

function DummyScreen() {
  return (
    <View>
      <Text>Dummy</Text>
    </View>
  );
}

export const AuthStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WelcomeEntry" component={WelcomeEntryScreen} />
    <Stack.Screen name="RegisterStart" component={RegisterStartScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
    <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
    <Stack.Screen name="RegisterIdentity" component={RegisterIdentityScreen} />
    <Stack.Screen name="RegisterHousing" component={RegisterHousingScreen} />
    <Stack.Screen name="RegisterWelcome" component={RegisterWelcomeScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);