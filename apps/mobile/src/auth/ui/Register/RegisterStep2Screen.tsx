import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import {
  NATIONALITY_OPTIONS,
  COUNTRY_OPTIONS,
} from '../../../utils/locationOptions';
import { Stepper } from '../components/Stepper';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStep2'>;

export const RegisterStep2Screen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation(['auth', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const { firstName, lastName, birthDate } = route.params;

  const [nationality, setNationality] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);

  const BIO_MAX_LENGTH = 200;

  const isFormValid = useMemo(() => {
    return nationality.trim() !== '' && country.trim() !== '';
  }, [nationality, country]);

  async function handleContinue() {
    setError(null);

    if (!isFormValid) {
      setError(t('auth:requiredFields'));
      return;
    }

    navigation.navigate('RegisterStep3', {
      firstName,
      lastName,
      birthDate,
      nationality,
      country,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior="padding"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

              <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
            </View>

            <View style={styles.content}>
              <Stepper current={2} total={5} />

              <Text style={styles.sectionTitle}>
                {t('auth:register.whereAreYouFrom')}
              </Text>

              <View style={styles.form}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={nationality}
                    onValueChange={(itemValue) => setNationality(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item
                      label={t('auth:register.nationality')}
                      value=""
                      color="#C0C0C0"
                    />
                    {NATIONALITY_OPTIONS.map((item) => (
                      <Picker.Item
                        key={item}
                        label={t(`auth:nationalities.${item}`)}
                        value={item}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={country}
                    onValueChange={(itemValue) => setCountry(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item
                      label={t('auth:register.countryOfResidence')}
                      value=""
                      color="#C0C0C0"
                    />
                    {COUNTRY_OPTIONS.map((item) => (
                      <Picker.Item
                        key={item}
                        label={t(`auth:countries.${item}`)}
                        value={item}
                      />
                    ))}
                  </Picker>
                </View>

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

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },

  keyboardContainer: {
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

  pickerWrapper: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: c.surface,
  },

  picker: {
    height: 58,
    width: '100%',
    color: c.text,
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