import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { 
  NATIONALITY_OPTIONS, 
  COUNTRY_OPTIONS 
} from '../../../utils/locationOptions';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stepper } from '../components/Stepper';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStep1'>;

export const RegisterStep1Screen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['auth', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isPasswordValid(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  const isFormValid = useMemo(() => {
    return (
      lastName.trim() !== '' &&
      firstName.trim() !== '' &&
      birthDate !== null 
    );
  }, [lastName, firstName, birthDate]);

  function handleContinue() {
    setError(null);

    if (!isFormValid || !birthDate) {
      setError(t('auth:requiredFields'));
      return;
    }

    navigation.navigate('RegisterStep2', {
      firstName,
      lastName,
      birthDate: birthDate!.toISOString(),
    });
  }

  function handleDateChange(event: any, selectedDate?: Date) {
    setShowDatePicker(false);

    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

            <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
          </View>

          <View style={styles.content}>
            <Stepper current={1} total={5} />

            <Text style={styles.sectionTitle}>{t('auth:register.whoAreYou')}</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={t('auth:register.lastName')}
                placeholderTextColor="#C0C0C0"
                value={lastName}
                onChangeText={setLastName}
              />

              <TextInput
                style={styles.input}
                placeholder={t('auth:register.firstName')}
                placeholderTextColor="#C0C0C0"
                value={firstName}
                onChangeText={setFirstName}
              />

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateText,
                    { color: birthDate ? '#111111' : '#C0C0C0' },
                  ]}
                >
                  {birthDate
                    ? birthDate.toLocaleDateString()
                    : t('auth:register.birthdate')}
                </Text>

                <FontAwesome name="calendar" size={16} color="#B4B4B4" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={birthDate || new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18),
                    )
                  }
                  onChange={handleDateChange}
                />
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
      </KeyboardAvoidingView>
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

  dateInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.surface,
  },

  dateText: {
    fontSize: 13,
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
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});