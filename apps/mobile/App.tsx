import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initI18n } from './src/i18n/i18n';
import { AuthStackNavigator } from './src/navigation/authStack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootNavigator } from 'src/navigation/rootNavigator';
import { ThemeProvider, useAppTheme } from 'src/theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { KeyboardProvider } from 'react-native-keyboard-controller';

import 'src/search/infrastructure/map/mapbox.config';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { fetchIdentityStatus } from 'src/auth/infrastructure/identity.api';
import { IdentityStatus } from 'src/auth/dtos/identityStatus';
import {
  navigationRef,
  useNotificationNavigation,
} from 'src/notifications/useNotificationNavigation';

enableScreens();

const Stack = createNativeStackNavigator();

// La coquille de navigation doit connaitre le theme : sans elle, le fond des
// transitions entre ecrans reste blanc dans le mode sombre.
function Coquille({
  isAuthenticated,
  isAdmin,
  identiteVerifiee,
  onIdentiteVerifiee,
  setIsAuthenticated,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  identiteVerifiee: boolean | null;
  onIdentiteVerifiee: () => void;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isDark, colors } = useAppTheme();

  useNotificationNavigation(isAuthenticated);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <RootNavigator
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        identiteVerifiee={identiteVerifiee}
        onIdentiteVerifiee={onIdentiteVerifiee}
        setIsAuthenticated={setIsAuthenticated}
      />
    </NavigationContainer>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [identiteVerifiee, setIdentiteVerifiee] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function setup() {
      await initI18n();

      try {
        const session = await getSession();

        setIsAuthenticated(Boolean(session?.accessToken));
        setIsAdmin(session?.user.isAdmin === true);
      } catch (error) {
        console.log('Session restore error:', error);
      }

      setReady(true);
    }
    setup();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      setIdentiteVerifiee(null);
      return;
    }

    getSession()
      .then((session) => setIsAdmin(session?.user.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      return;
    }

    let abandonne = false;

    fetchIdentityStatus()
      .then((status) => {
        if (!abandonne) {
          setIdentiteVerifiee(status === IdentityStatus.VERIFIED);
        }
      })
      .catch(() => {
        if (!abandonne) setIdentiteVerifiee(null);
      });

    return () => {
      abandonne = true;
    };
  }, [isAuthenticated, isAdmin]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
        <ThemeProvider>
          <Coquille
            identiteVerifiee={identiteVerifiee}
            onIdentiteVerifiee={() => setIdentiteVerifiee(true)}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            setIsAuthenticated={setIsAuthenticated}
          />
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}