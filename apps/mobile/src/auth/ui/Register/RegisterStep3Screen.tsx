import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stepper } from '../components/Stepper';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStep3'>;

export const RegisterStep3Screen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation(['auth', 'common']);
  const { firstName, lastName, birthDate, nationality, country } = route.params;

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    return email.trim() !== '' && phone.trim() !== '';
  }, [email, phone]);
    
  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, '');
    setPhone(digitsOnly);
  }

  async function handleContinue() {
    setError(null);

    if (!isFormValid) {
      setError(t('auth:requiredFields'));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t('auth:login.invalidEmail'));
      return;
    }

    navigation.navigate('RegisterStep4', {
      firstName,
      lastName,
      birthDate,
      nationality,
      country,
      email,
      phone,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    >
                    <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
                </View>

                <View style={styles.content}>
                    <Stepper current={3} total={5} />

                    <Text style={styles.sectionTitle}>
                    {t('auth:register.yourContact')}
                    </Text>

                    <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('auth:register.email')}
                        placeholderTextColor="#C0C0C0"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder={t('auth:register.phone')}
                        placeholderTextColor="#C0C0C0"
                        value={phone}
                        onChangeText={handlePhoneChange}
                        keyboardType="number-pad"
                        inputMode="numeric"
                        maxLength={15}
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleContinue}
                    style={styles.buttonWrapper}
                    >
                    <LinearGradient
                        colors={
                        isFormValid
                            ? ['#52D1A6', '#2DA7F3']
                            : ['#BFE8DC', '#B8D8EF']
                        }
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryText}>{t('common:continue')}</Text>
                    </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 16,
    color: '#111111',
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 18,
  },

  form: {
    marginTop: 8,
  },

  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 13,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },

  footer: {
    width: '100%',
  },

  buttonWrapper: {
    width: '100%',
  },

  primaryButton: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});