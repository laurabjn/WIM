import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterWelcome'> & {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const RegisterWelcomeScreen: React.FC<Props> = ({ navigation, setIsAuthenticated }) => {
  const { t } = useTranslation(['auth', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  function handleGuidedTour() {
    // TODO : plus tard tu feras une vraie visite guidée
    // navigation.navigate('Onboarding');
  }

  function handleAccessApp() {
    setIsAuthenticated(true);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          <View style={styles.card}>
            <View style={styles.centerSection}>
              <Image
                source={require('../../../../assets/logo.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>{t('auth:welcomeTitle')}</Text>
            </View>

            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGuidedTour}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryButtonText}>
                  {t('auth:guidedTour')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonWrapper}
                onPress={handleAccessApp}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#52D1A6', '#2DA7F3']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>
                    {t('auth:goToWim')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },

  stepLabel: {
    alignSelf: 'flex-start',
    marginLeft: 6,
    marginBottom: 8,
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '500',
  },

  card: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  logo: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
    textAlign: 'center',
  },

  bottomSection: {
    gap: 12,
    paddingBottom: 40,
  },

  secondaryButton: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },

  buttonWrapper: {
    width: '100%',
  },

  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.onContrast,
  },
});