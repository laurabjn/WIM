import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { requestPasswordReset } from '../../application/requestPassword.usecase';
import { AuthStackParamList } from '../../../navigation/authStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation(['auth']);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError(t('auth:requiredFields'));
      return;
    }

    const rawLang = i18n.language;
    const locale: 'fr' | 'en' = rawLang === 'en' ? 'en' : 'fr';

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email, locale);
      setSuccess(t('auth:login.forgotSuccess'));
    } catch (err: any) {
      setError(err?.message ?? t('auth:genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerSection}>
            <Image
              source={require('../../../../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>{t('auth:login.forgotPasswordSearchTitle')}</Text>
            <Text style={styles.description}>
              {t('auth:login.forgotPasswordSearchDescription')}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <TextInput
              testID="forgot-password-email-input"
              style={styles.input}
              placeholder={t('auth:login.email')}
              placeholderTextColor="#B4B4B4"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {error && (
              <Text testID="forgot-password-error" style={styles.errorText}>
                {error}
              </Text>
            )}

            {success && (
              <Text testID="forgot-password-success" style={styles.successText}>
                {success}
              </Text>
            )}

            <TouchableOpacity
              testID="forgot-password-submit-button"
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? t('auth:login.sendingResetLink') : t('auth:login.login')}
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
    paddingHorizontal: 14,
    paddingVertical: 20,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 16,
    color: '#111111',
  },

  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  logo: {
    width: 54,
    height: 54,
    marginBottom: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 12,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 290,
  },

  bottomSection: {
    gap: 10,
  },

  input: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  submitButton: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },

  errorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },

  successText: {
    fontSize: 12,
    color: '#16A34A',
    textAlign: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});