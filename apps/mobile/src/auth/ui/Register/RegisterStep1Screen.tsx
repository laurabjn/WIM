import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/authStack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterStep1'>;

export const RegisterStep1Screen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['auth', 'common']);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nationality, setNationality] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  function isPasswordValid(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  const isFormValid = useMemo(() => {
    return (
      email.trim() !== '' &&
      password.trim() !== '' &&
      lastName.trim() !== '' &&
      firstName.trim() !== '' &&
      birthDate !== null &&
      nationality.trim() !== '' &&
      country.trim() !== '' &&
      phone.trim() !== ''
    );
  }, [email, password, lastName, firstName, birthDate, nationality, country, phone]);

  function handleContinue() {
    setError(null);

    if (!isFormValid) {
      setError(t('auth:requiredFields'));
      return;
    }

    if (!isPasswordValid(password)) {
      setError(t('auth:passwordRules'));
      return;
    }

    navigation.navigate('RegisterStep2', {
      email,
      password,
      firstName,
      lastName,
      birthDate: birthDate!.toISOString(),
      nationality,
      country,
      phone,
    });
  }

  function handleDateChange(event: any, selectedDate?: Date) {
    setShowDatePicker(false);

    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={`${t('auth:register.lastName')} *`}
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder={`${t('auth:register.firstName')} *`}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: birthDate ? '#000' : '#9CA3AF' }}>
              {birthDate
                ? birthDate.toLocaleDateString()
                : `${t('auth:register.birthdate')} *`}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
              onChange={handleDateChange}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder={`${t('auth:register.nationality')} *`}
            value={nationality}
            onChangeText={setNationality}
          />
          <TextInput
            style={styles.input}
            placeholder={`${t('auth:register.countryOfResidence')} *`}
            value={country}
            onChangeText={setCountry}
          />
          <TextInput
            style={styles.input}
            placeholder={`${t('auth:register.email')} *`}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder={`${t('auth:register.phone')} *`}
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={[
              styles.input,
              password.length > 0 && !isPasswordValid(password) && { borderColor: '#DC2626' }
            ]}
            placeholder={`${t('auth:register.password')} *`}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {password.length > 0 && !isPasswordValid(password) && (
            <Text style={styles.passwordHint}>
              {t('auth:passwordRules')}
            </Text>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 24,
    elevation: 4,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 45,
  },
  form: {
    marginBottom: 20, 
  },
  footer: {
    marginTop: 8,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  passwordHint: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 10,
  },
  input: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 14,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  buttonWrapper: {
    marginTop: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 17,
  },
});