import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { requestPasswordReset } from '../application/requestPassword.usecase';
import { useTranslation } from 'react-i18next';

export const ForgotPasswordScreen: React.FC = () => {
  const { t, i18n } = useTranslation('auth');

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!email) {
      setError(t('requiredFields'));
      return;
    }

    const rawLang = i18n.language;
    const locale: 'fr' | 'en' = rawLang === 'en' ? 'en' : 'fr';

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email, locale);
      setSuccess(t('forgotSuccess'));
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View>
      <Text>{t('forgotPasswordTitle')}</Text>
      <Text>{t('forgotPasswordDescription')}</Text>

      <Text>{t('email')}</Text>
        <TextInput
            testID='forgot-password-email-input'
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
        />

      {error && <Text testID='forgot-password-error'>{error}</Text>}
      {success && <Text testID='forgot-password-success'>{success}</Text>}

       <Button
            testID='forgot-password-submit-button'
            title={isSubmitting ? t('sendingResetLink') : t('sendResetLink')}
            onPress={handleSubmit}
            disabled={isSubmitting}
        />
    </View>
  );
};
