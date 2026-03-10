import React from 'react';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterWelcome'>;

export const RegisterWelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['auth', 'common']);

  function handleGuidedTour() {
    // TODO : plus tard tu feras une vraie visite guidée
    // navigation.navigate('Onboarding');
  }

  function handleAccessApp() {
    // TODO : basculer vers la navigation principale
    // navigation.reset({ index: 0, routes: [{ name: 'AppHome' }] });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F4',
  },

  container: {
    flex: 1,
    backgroundColor: '#F3F3F4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
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
    width: '100%',
    maxWidth: 390,
    minHeight: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
    color: '#111111',
    textAlign: 'center',
  },

  bottomSection: {
    gap: 12,
  },

  secondaryButton: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
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
    color: '#FFFFFF',
  },
});