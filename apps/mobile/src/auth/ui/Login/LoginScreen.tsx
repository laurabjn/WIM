import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../../../navigation/authStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { loginUser } from '../../application/loginUser.usecase';
import { saveSession } from 'src/auth/infrastructure/authStorage';
import { BackButton } from 'src/shared/ui/BackButton';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const LoginScreen: React.FC<Props> = ({ navigation, setIsAuthenticated }) => {
  const { t } = useTranslation(['auth', 'common']);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);

    if (!email || !password) {
      setError(t('auth:requiredFields'));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t('auth:login.invalidEmail'));
      return;
    }

    if (!isStrongPassword(password)) {
      setError(t('auth:login.weakPassword'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser({ email, password });
      // TODO: stocker tokens (SecureStore, MMKV, etc.)
      // TODO: navigate vers l’écran principal
      await saveSession({
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName ?? null,
          lastName: result.user.lastName ?? null,
          isAdmin: result.user.isAdmin ?? false,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      console.log('Session saved successfully');
      setIsAuthenticated(true);
    } catch (err: any) {
      console.log('Login error:', err);
      setError(err.message ?? t('auth:genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    navigation.navigate('ForgotPassword');
  }

    function handleGoogleLogin() {
    console.log('Google login');
  }

  function handleAppleLogin() {
    console.log('Apple login');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            <View style={styles.card}>
              <View style={styles.header}>
                <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
              </View>

              <View style={styles.topSection}>
                <Image
                  source={require('../../../../assets/logo.jpg')}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.headerTitle}>{t('auth:login.title')}</Text>
              </View>

              <View style={styles.content}>
                <View style={styles.socialSection}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleGoogleLogin}
                    activeOpacity={0.9}
                  >
                    <View style={styles.socialContent}>
                      <FontAwesome
                        name="google"
                        size={18}
                        color="#111111"
                        style={styles.icon}
                      />
                      <Text style={styles.socialButtonText}>
                        {t('auth:login.loginWithGoogle')}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleAppleLogin}
                    activeOpacity={0.9}
                  >
                    <View style={styles.socialContent}>
                      <FontAwesome
                        name="apple"
                        size={20}
                        color="#111111"
                        style={styles.icon}
                      />
                      <Text style={styles.socialButtonText}>
                        {t('auth:login.loginWithApple')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                  <TextInput
                    testID="email-input"
                    style={styles.input}
                    placeholder={t('auth:login.email')}
                    placeholderTextColor="#B4B4B4"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />

                  <View style={styles.passwordWrapper}>
                    <TextInput
                      testID="password-input"
                      style={styles.passwordInput}
                      placeholder={t('auth:login.password')}
                      placeholderTextColor="#B4B4B4"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      value={password}
                      onChangeText={setPassword}
                    />

                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword((prev) => !prev)}
                      activeOpacity={0.7}
                    >
                      <FontAwesome
                        name={showPassword ? 'eye-slash' : 'eye'}
                        size={18}
                        color="#7B7B7B"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.forgotPasswordWrapper}
                    onPress={handleForgotPassword}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {t('auth:login.forgotPasswordTitle')}
                    </Text>
                  </TouchableOpacity>

                  {error && (
                    <Text testID="error-message" style={styles.errorText}>
                      {error}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  testID="submit-button"
                  activeOpacity={0.9}
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={['#52D1A6', '#2DA7F3']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryText}>
                      {isSubmitting
                        ? t('auth:login.loggingIn')
                        : t('auth:login.login')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  scrollContent: {
    flexGrow: 1,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
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
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 16,
    color: '#111111',
  },

  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    marginBottom: 12,
  },

  logo: {
    width: 58,
    height: 58,
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  socialSection: {
    gap: 12,
    marginBottom: 24,
  },

  socialButton: {
    height: 58,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
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
    color: '#111111',
  },

  formSection: {
    marginTop: 8,
  },

  input: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  forgotPasswordWrapper: {
    marginTop: 2,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },

  forgotPasswordText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  errorText: {
    marginTop: 10,
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },

  footer: {
    width: '100%',
    marginTop: 20,
  },

  buttonWrapper: {
    width: '100%',
    marginBottom: 20,
  },

  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 12,
  },

  passwordInput: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingRight: 46,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  eyeButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});