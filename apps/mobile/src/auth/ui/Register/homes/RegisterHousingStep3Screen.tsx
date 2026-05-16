import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from 'src/navigation/authStack';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<AuthStackParamList,'RegisterHousingStep3'>;

export const RegisterHousingStep3Screen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation(['auth', 'common', 'home']);
  const { photos, description } = route.params;

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    return (
      address.trim() !== '' 
    );
  }, [address, city, country, postalCode]);

  async function handleContinue() {
    setError(null);
    
    if (!isFormValid) {
      setError(t('auth:requiredFields'));
      return;
    }

    navigation.navigate('RegisterHousingStep4', {
      photos,
      description,
      location: {
        address: address.trim(),
        city: 'Bordeaux', //TODO: get from location
        country: 'France', //TODO: get from location
        latitude: null, //coords?.latitude,
        longitude: null, //coords?.longitude,
      }
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('auth:register.title')}</Text>
            </View>

            <View style={styles.content}>
              <Stepper current={3} total={4} />
              <Text style={styles.sectionTitle}>
              {t('home:locationTitle')}
              </Text>
                          
              <Text style={styles.sectionDescription}>
                {t('home:locationDescription')}
              </Text>


              <View style={styles.inputsWrapper}>
                <TextInput
                  style={styles.bioInput}
                  placeholder={t('home:address')}
                  placeholderTextColor="#B4B4B4"
                  value={address}
                  onChangeText={setAddress}
                  multiline={false}
                  numberOfLines={1}
                  autoCorrect={false}
                  autoCapitalize="words"
                  autoComplete="street-address"
                  textContentType="fullStreetAddress"
                  returnKeyType="next"
                />

                {/* <TextInput
                  style={styles.bioInput}
                  placeholder={t('home:postalCode')}
                  placeholderTextColor="#B4B4B4"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.bioInput}
                  placeholder={t('home:city')}
                  placeholderTextColor="#B4B4B4"
                  value={city}
                  onChangeText={setCity}
                  multiline={false}
                  numberOfLines={1}
                  autoCorrect={false}
                  autoCapitalize="words"
                  autoComplete="postal-address-locality"
                  textContentType="addressCity"
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.bioInput}
                  placeholder={t('home:country')}
                  placeholderTextColor="#B4B4B4"
                  value={country}
                  onChangeText={setCountry}
                  multiline={false}
                  numberOfLines={1}
                  autoCorrect={false}
                  autoCapitalize="words"
                  autoComplete="country"
                  returnKeyType="done"
                /> */}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.buttonWrapper}
                onPress={handleContinue}
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
                  <Text style={styles.primaryText}>
                    {t('common:continue')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },
  errorText: {
    marginTop: 10,
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
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
  sectionDescription: {
    fontSize: 12,
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: 12,
  },
  inputsWrapper: {
    gap: 12,
  },
  bioInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },
  charCount: {
    fontSize: 11,
    color: '#7C7C7C',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
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