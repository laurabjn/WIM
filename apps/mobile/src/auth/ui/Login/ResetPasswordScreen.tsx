import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../application/resetPassword.usecase';

interface ResetPasswordScreenProps {
  token: string;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ token }) => {
  const { t } = useTranslation('auth');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirm) {
      setError(t('errorRequired'));
      return;
    }

    if (newPassword !== confirm) {
      setError(t('resetErrorPasswordsDontMatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      setSuccess(t('resetSuccess'));
      // TODO: navigation vers écran de login
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View>
      <Text>{t('resetPasswordTitle')}</Text>

      <Text>{t('newPassword')}</Text>
      <TextInput
        testID='reset-password-new-password-input'
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Text>{t('confirmPassword')}</Text>
      <TextInput
        testID='reset-password-confirm-input'
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      {error && <Text testID='reset-password-error'>{error}</Text>}
      {success && <Text testID='reset-password-success'>{success}</Text>}

      <Button
        testID='reset-password-submit-button'
        title={isSubmitting ? t('resettingPassword') : t('resetPassword')}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
};
