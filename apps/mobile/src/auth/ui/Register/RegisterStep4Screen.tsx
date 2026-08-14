import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUserApi } from '../../infrastructure/api';
import { Stepper } from '../components/Stepper';
import { FontAwesome } from '@expo/vector-icons';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStep4'>;

export const RegisterStep4Screen: React.FC<Props> = ({ route, navigation }) => {
    const { t } = useTranslation(['auth', 'common']);
    const themeColors = useThemeColors();
    const styles = useMemo(() => createStyles(themeColors), [themeColors]);
    const { firstName, lastName, birthDate, nationality, country, email, phone } = route.params;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function isPasswordValid(value: string) {
        return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    }
    
    const isFormValid = useMemo(() => {
        return (
        password.trim() !== '' &&
        confirmPassword.trim() !== '' &&
        password === confirmPassword &&
        isPasswordValid(password)
        );
    }, [password, confirmPassword]);

    async function handleContinue() {
        setError(null);

        if (!password || !confirmPassword) {
        setError(t('auth:requiredFields'));
        return;
        }

        if (!isPasswordValid(password)) {
        setError(t('auth:passwordRules'));
        return;
        }

        if (password !== confirmPassword) {
        setError(t('auth:resetErrorPasswordsDontMatch'));
        return;
        }

        navigation.navigate('RegisterStep5', {
          firstName,
          lastName,
          birthDate,
          nationality,
          country,
          email,
          phone,
          password,
        });
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
                <View style={styles.card}>
                <View style={styles.header}>
                    <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

                    <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
                </View>

                <View style={styles.content}>
                    <Stepper current={4} total={5} />

                    <Text style={styles.sectionTitle}>
                    {t('auth:register.createPassword')}
                    </Text>

                    <View style={styles.form}>
                      <View style={styles.passwordWrapper}>
                        <TextInput
                          style={[
                            styles.passwordInput,
                            password.length > 0 &&
                              !isPasswordValid(password) &&
                              styles.inputError,
                          ]}
                          placeholder={t('auth:register.password')}
                          placeholderTextColor="#C0C0C0"
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                        />

                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowPassword((prev) => !prev)}
                        >
                          <FontAwesome
                            name={showPassword ? 'eye-slash' : 'eye'}
                            size={18}
                            color="#7B7B7B"
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.passwordWrapper}>
                        <TextInput
                          style={[
                            styles.passwordInput,
                            confirmPassword.length > 0 &&
                              password !== confirmPassword &&
                              styles.inputError,
                          ]}
                          placeholder={t('auth:register.confirmPassword')}
                          placeholderTextColor="#C0C0C0"
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                        />

                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                        >
                          <FontAwesome
                            name={showConfirmPassword ? 'eye-slash' : 'eye'}
                            size={18}
                            color="#7B7B7B"
                          />
                        </TouchableOpacity>
                      </View>

                    {password.length > 0 && !isPasswordValid(password) && (
                        <Text style={styles.helperText}>{t('auth:register.passwordRules')}</Text>
                    )}

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
        </SafeAreaView>
    );
}

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
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: c.text,
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
    borderColor: c.border,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 13,
    color: c.text,
    backgroundColor: c.surface,
  },

  inputError: {
    borderColor: c.danger,
  },

  helperText: {
    fontSize: 12,
    color: c.danger,
    marginTop: -4,
    marginBottom: 8,
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: c.danger,
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
    color: c.onContrast,
    fontWeight: '700',
    fontSize: 16,
  },

  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 12,
  },

  passwordInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 14,
    color: c.text,
    backgroundColor: c.surface,
  },

  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});