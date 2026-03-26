import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/authStack';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<AuthStackParamList, 'WelcomeEntry'>;

export const WelcomeEntryScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['auth', 'common']);

  function handleRegister() {
    navigation.navigate('RegisterStart');
  }

  function handleLogin() {
      navigation.navigate('Login');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.centerSection}>
            <Image
              source={require('../../../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>{t('auth:goToWim')}</Text>
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRegister}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryButtonText}>
                {t('auth:register.signUpWithEmail')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryButtonText}>
                {t('auth:login.login')}
              </Text>
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
  },

  stepLabel: {
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginBottom: 8,
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '500',
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 16,
  },

  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },

  bottomSection: {
    gap: 12,
    paddingBottom: 30,
  },

  secondaryButton: {
    height: 58,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
});