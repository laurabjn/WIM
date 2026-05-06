import React from 'react';
import { RegisterStartScreen } from '../auth/ui/Register/RegisterStartScreen';
import { RegisterStep1Screen } from '../auth/ui/Register/RegisterStep1Screen';
import { RegisterStep2Screen } from '../auth/ui/Register/RegisterStep2Screen';
import { RegisterIdentityScreen } from '../auth/ui/Register/RegisterIdentityScreen';
import { RegisterHousingStep1Screen } from '../auth/ui/Register/homes/RegisterHousingStep1Screen';
import { RegisterWelcomeScreen } from '../auth/ui/Register/RegisterWelcomeScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeEntryScreen } from '../auth/ui/WelcomeEntryScreen';
import { LoginScreen } from '../auth/ui/Login/LoginScreen';
import { ForgotPasswordScreen } from '../auth/ui/Login/ForgotPasswordScreen';
import { RegisterStep3Screen } from '../auth/ui/Register/RegisterStep3Screen';
import { RegisterStep4Screen } from '../auth/ui/Register/RegisterStep4Screen';
import { RegisterStep5Screen } from '../auth/ui/Register/RegisterStep5Screen';
import { RegisterHousingStep2Screen } from 'src/auth/ui/Register/homes/RegisterHousingStep2Screen';
import { RegisterHousingStep3Screen } from 'src/auth/ui/Register/homes/RegisterHousingStep3Screen';
import { RegisterHousingStep4Screen } from 'src/auth/ui/Register/homes/RegisterHousingStep4Screen';
import { PickedPhoto } from '@wim/shared/home/home.type';

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
  RegisterHousingStep1: undefined;
  RegisterHousingStep2: { photos: PickedPhoto[] };
  RegisterHousingStep3: {
    photos: PickedPhoto[];
    description: string
  };
  RegisterHousingStep4: {
    photos: PickedPhoto[];
    description: string;
    location: {
      address: string;
      city: string;
      country: string;
      latitude?: number | null;
      longitude?: number | null;
    };
  };
  RegisterWelcome: undefined;
};

type Props = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStackNavigator: React.FC<Props> = ({ setIsAuthenticated }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WelcomeEntry" component={WelcomeEntryScreen} />
    <Stack.Screen name="RegisterStart" component={RegisterStartScreen} />
    <Stack.Screen name="Login">
      {(props) => (
        <LoginScreen
          {...props}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
    <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
    <Stack.Screen name="RegisterStep3" component={RegisterStep3Screen} />
    <Stack.Screen name="RegisterStep4" component={RegisterStep4Screen} />
    <Stack.Screen name="RegisterStep5" component={RegisterStep5Screen} />
    <Stack.Screen name="RegisterIdentity" component={RegisterIdentityScreen} />
    <Stack.Screen name="RegisterHousingStep1" component={RegisterHousingStep1Screen} />
    <Stack.Screen name="RegisterHousingStep2" component={RegisterHousingStep2Screen} />
    <Stack.Screen name="RegisterHousingStep3" component={RegisterHousingStep3Screen} />
    <Stack.Screen name="RegisterHousingStep4" component={RegisterHousingStep4Screen} />
    <Stack.Screen name="RegisterWelcome">
      {(props) => (
        <RegisterWelcomeScreen
          {...props}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);