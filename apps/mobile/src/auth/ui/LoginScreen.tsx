import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { loginUserApi } from '../application/loginUser.usecase';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);

    if (!email || !password) {
      setError(t('requiredFields'));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t('invalidEmail'));
      return;
    }

    if (!isStrongPassword(password)) {
      setError(t('weakPassword'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUserApi({ email, password });
      // TODO: stocker tokens (SecureStore, MMKV, etc.)
      // TODO: navigate vers l’écran principal
      console.log('Logged in user:', result.user);
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View>
      <Text>{t('login')}</Text>

      <Text>{t('email')}</Text>
        <TextInput
          testID="email-input"
          placeholder={t('email')}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

      <Text>{t('password')}</Text>
      <TextInput
        testID="password-input"
        placeholder={t('password')}
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text testID="error-message">{error}</Text>}

      <Button
        testID="submit-button"
        title={isSubmitting ? t('loggingIn') : t('login')}
        onPress={handleLogin}
        disabled={isSubmitting}
      />
    </View>
  );
};
