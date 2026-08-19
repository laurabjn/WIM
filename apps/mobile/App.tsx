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

import 'src/search/infrastructure/map/mapbox.config';
import { getSession } from 'src/auth/infrastructure/authStorage';
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
  setIsAuthenticated,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isDark, colors } = useAppTheme();

  // Toucher une notification doit ouvrir la conversation visee, pas seulement
  // l'application. La navigation n'est tentee qu'une fois connecte.
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
        setIsAuthenticated={setIsAuthenticated}
      />
    </NavigationContainer>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function setup() {
      await initI18n();

      // Une session valide dormait dans le stockage sans que personne ne la
      // lise : les identifiants etaient redemandes a chaque ouverture. La
      // lecture renouvelle le jeton au passage, et rend null si la session est
      // reellement morte.
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

  // Une connexion qui vient d'aboutir change de compte : le drapeau doit etre
  // relu, sinon un administrateur atterrirait dans l'application ordinaire
  // jusqu'au prochain demarrage.
  useEffect(() => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      return;
    }

    getSession()
      .then((session) => setIsAdmin(session?.user.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [isAuthenticated]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Coquille
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            setIsAuthenticated={setIsAuthenticated}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}