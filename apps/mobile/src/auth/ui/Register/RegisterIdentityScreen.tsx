import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet, 
  Linking,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkIdentityStatus } from '../../application/checkIdentityStatus.usecase';
import { LinearGradient } from 'expo-linear-gradient';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterIdentity'>;

export const RegisterIdentityScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation(['auth', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const { identityRedirectUrl } = route.params;
  
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hasOpenedVerification, setHasOpenedVerification] = useState(false);

  async function handleContinue() {
    setStatusMessage(null);

    /*if (!hasOpenedVerification) {
      if (!identityRedirectUrl) {
        setStatusMessage(t('auth:identity.error'));
        return;
      }

      setHasOpenedVerification(true);
      await Linking.openURL(identityRedirectUrl);
      return;
    }*/

    setIsChecking(true);

    try {
      // const status = await checkIdentityStatus();
      const status = 'VERIFIED'; // TODO: remove mock
      console.log('Identity verification status:', status);

      if (status === 'VERIFIED') {
        navigation.navigate('RegisterHousingStep1');
        return;
      }

      if (status === 'IN_PROGRESS') {
        setStatusMessage(t('auth:identity.pending'));
        return;
      }

      if (status === 'REJECTED') {
        setStatusMessage(t('auth:identity.rejected'));
        return;
      }

      setStatusMessage(t('auth:identity.retry'));
    } catch (e: any) {
      setStatusMessage(e?.message ?? t('auth:identity.error'));
    } finally {
      setIsChecking(false);
    }
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
            <View style={styles.header}>
              <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

              <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.centerText}>
                {t('auth:register.identityVerification')}
              </Text>

              {statusMessage && (
                <Text style={styles.statusMessage}>{statusMessage}</Text>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.buttonWrapper}
                onPress={handleContinue}
                disabled={isChecking}
              >
                <LinearGradient
                  colors={['#52D1A6', '#2DA7F3']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryButton}
                >
                  {isChecking ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryText}>{t('common:continue')}</Text>
                  )}
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
    marginBottom: 20,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 16,
    color: c.text,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  centerText: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
    textAlign: 'center',
  },

  statusMessage: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: c.textMuted,
    textAlign: 'center',
  },

  footer: {
    width: '100%',
  },

  buttonWrapper: {
    width: '100%',
    gap: 12,
    paddingBottom: 10,
  },

  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: c.onContrast,
    fontWeight: '700',
    fontSize: 16,
  },
});