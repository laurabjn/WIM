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
import { RegisterStep3Screen } from '../auth/ui/Register/RegisterStep3Screen';
import { RegisterStep4Screen } from '../auth/ui/Register/RegisterStep4Screen';
import { RegisterStep5Screen } from '../auth/ui/Register/RegisterStep5Screen';

export type AuthStackParamList = {
  WelcomeEntry: undefined;
  RegisterStart: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  RegisterStep1: undefined;
  RegisterStep2: {
    firstName: string;
    lastName: string;
    birthDate: string;
  };
  RegisterStep3: {
    firstName: string;
    lastName: string;
    birthDate: string;
    nationality: string;
    country: string;
  };
  RegisterStep4: {
    firstName: string;
    lastName: string;
    birthDate: string;
    nationality: string;
    country: string;
    email: string;
    phone: string;
  };
  RegisterStep5: {
    firstName: string;
    lastName: string;
    birthDate: string;
    nationality: string;
    country: string;
    email: string;
    phone: string;
    password: string;
  };
  RegisterIdentity: { identityRedirectUrl?: string };
  RegisterHousing: undefined;
  RegisterWelcome: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WelcomeEntry" component={WelcomeEntryScreen} />
    <Stack.Screen name="RegisterStart" component={RegisterStartScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
    <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
    <Stack.Screen name="RegisterStep3" component={RegisterStep3Screen} />
    <Stack.Screen name="RegisterStep4" component={RegisterStep4Screen} />
    <Stack.Screen name="RegisterStep5" component={RegisterStep5Screen} />
    <Stack.Screen name="RegisterIdentity" component={RegisterIdentityScreen} />
    <Stack.Screen name="RegisterHousing" component={RegisterHousingScreen} />
    <Stack.Screen name="RegisterWelcome" component={RegisterWelcomeScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);