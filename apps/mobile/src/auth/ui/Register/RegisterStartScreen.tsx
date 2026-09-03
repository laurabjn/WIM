import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { useConnexionSociale } from '../useConnexionSociale';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStart'> & {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const RegisterStartScreen: React.FC<Props> = ({
  navigation,
  setIsAuthenticated,
}) => {
    const { t } = useTranslation('auth');
    const themeColors = useThemeColors();
    const styles = useMemo(() => createStyles(themeColors), [themeColors]);

    const social = useConnexionSociale({
      onConnecte: () => setIsAuthenticated(true),
      onErreur: (message) => Alert.alert('', message),
    });
    
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
          </View>
          
          <View style={styles.centerSection}>
            <Image
              source={require('../../../../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>{t('register.signUpTitle')}</Text>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.legalText}>
              {t('register.usageConditions')}
            </Text>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={social.connecterGoogle}
              disabled={!social.googleDisponible || social.enCours !== null}
            >
              <View style={styles.socialContent}>
                <FontAwesome name="google" size={18} color={themeColors.text} style={styles.icon} />
                <Text style={styles.socialButtonText}>
                  {t('register.googleSignUp')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={social.connecterApple}
              disabled={!social.appleDisponible || social.enCours !== null}
            >
              <View style={styles.socialContent}>
                <FontAwesome name="apple" size={20} color={themeColors.text} style={styles.icon} />
                <Text style={styles.socialButtonText}>
                  {t('register.signUpWithApple')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterStep1')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{t('register.signUpWithEmail')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },
  container: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 100,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: c.text,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 22,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: c.text,
    textAlign: 'center',
    marginBottom: 90,
  },
  bottomSection: {
    gap: 12,
    marginBottom: 20,
  },
  legalText: {
    fontSize: 11,
    lineHeight: 18,
    color: c.textMuted,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  socialButton: {
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
  },
  primaryButton: {
    height: 52,
    borderRadius: 999,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
});