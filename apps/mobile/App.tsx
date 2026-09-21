import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-native';
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
import { demarrerLaRemonteeDesErreurs } from 'src/observabilite/sentry';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { KeyboardProvider } from 'react-native-keyboard-controller';

import 'src/search/infrastructure/map/mapbox.config';
import {
  getSession,
  sessionToujoursValide,
} from 'src/auth/infrastructure/authStorage';
import { ChargementScreen } from 'src/shared/ui/chargement/ChargementScreen';
import { IdentityGateScreen } from 'src/auth/ui/IdentityGateScreen';
import {
  ecouterLaPorteIdentite,
  fermerLaPorteIdentite,
} from 'src/auth/ui/identityGate';
import {
  navigationRef,
  useNotificationNavigation,
} from 'src/notifications/useNotificationNavigation';

enableScreens();
demarrerLaRemonteeDesErreurs();

const Stack = createNativeStackNavigator();

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
  const [porteIdentite, setPorteIdentite] = useState(false);
  const [ready, setReady] = useState(false);
  const [logoTermine, setLogoTermine] = useState(false);

  useEffect(() => {
    async function setup() {
      await initI18n();

      try {
        const session = await getSession();
        const valide = session ? await sessionToujoursValide(session) : false;

        setIsAuthenticated(valide);
        setIsAdmin(valide && session?.user.isAdmin === true);
      } catch (error) {
        console.log('Session restore error:', error);
      }

      setReady(true);
    }
    setup();
  }, []);

  useEffect(() => ecouterLaPorteIdentite(setPorteIdentite), []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      setPorteIdentite(false);
      return;
    }

    getSession()
      .then((session) => setIsAdmin(session?.user.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [isAuthenticated]);

  if (!ready || !logoTermine) {
    return <ChargementScreen onFin={() => setLogoTermine(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
        <ThemeProvider>
          <Coquille
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            setIsAuthenticated={setIsAuthenticated}
          />

          <Modal
            visible={porteIdentite}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => fermerLaPorteIdentite(true)}
          >
            <IdentityGateScreen
              onVerified={() => fermerLaPorteIdentite(false)}
              onFermer={() => fermerLaPorteIdentite(true)}
            />
          </Modal>
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}