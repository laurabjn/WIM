import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { View, TextInput, Button, Text } from 'react-native';
import { registerUserApi } from '../infrastructure/api';

import {
  isEmailValid,
  isPasswordValid,
} from '@wim/shared'; 

export const RegisterScreen: React.FC = () => {
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email || !password || !firstName || !lastName) {
      setError(t('requiredFields'));
      return;
    }

    if (!isEmailValid(email)) {
      setError(t('emailRules'));
      return;
    }

    if (!isPasswordValid(password)) {
      setError(t('passwordRules'));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUserApi({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      // TODO : navigation vers écran de login ou home
    } catch (err: any) {
      setError(err.message ?? t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View>
      <TextInput
        testID="email-input"
        placeholder={t('email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        testID="password-input"
        placeholder={t('password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        testID='first-name-input'
        placeholder={t('firstNameLabel')}
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        testID='last-name-input'
        placeholder={t('lastNameLabel')}
        value={lastName}
        onChangeText={setLastName}
      />

      {error && <Text testID="error-message">{error}</Text>}

      <Button
        testID="submit-button"
        title={isSubmitting ? t('submitting') : t('submit')}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
};