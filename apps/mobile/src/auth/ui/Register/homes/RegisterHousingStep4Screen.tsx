import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from 'src/navigation/authStack';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper';
import { LinearGradient } from 'expo-linear-gradient';
import { NumberChip } from 'src/profile/ui/components/NumberChip';
import { createHome } from 'src/home/infrastructure/home.api';
import { uploadHomePhotos } from 'src/auth/infrastructure/upload/uploadHomeImage';
import { getSession } from 'src/auth/infrastructure/authStorage';

type Props = NativeStackScreenProps<AuthStackParamList,'RegisterHousingStep4'>;

export const RegisterHousingStep4Screen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation(['auth', 'common', 'home']);
  const { photos = [], description, location } = route.params;

  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  const [travelersCount, setTravelersCount] = useState<number>();

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getSession();
        setToken(session?.accessToken ?? null);
        console.log('Loaded session:', session);
      } catch (error) {
        console.log('Error loading session:', error);
        setToken(null);
      } finally {
        setIsSessionLoading(false);
      }
    }

    loadSession();
  }, []);

  const isFormValid = useMemo(() => {
    return (
      travelersCount !== undefined && travelersCount > 0
    );
  }, [travelersCount]);

  async function handleContinue() {
    setError(null);
    
    if (!isFormValid) {
      setError(t('auth:requiredFields'));
      return;
    }

    if (isSessionLoading) {
      return;
    }

    if (!token) {
      setError('Votre session a expiré. Merci de vous reconnecter.');
      return;
    }

    try {
      const homeData = {
        title: 'Mon logement',
        description,
        address: location.address,
        city: location.city,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        capacity: travelersCount!,
        beds: 1,
        bathrooms: 1,
        homeType: 'HOUSE',
        amenities: [],
        carExchangeAccepted: false,
      };
      
      const createdHome = await createHome(token!, homeData);
      console.log('Home created successfully:', createdHome);
      console.log('photos to upload:', photos);

      const uploadedPhotos = await uploadHomePhotos(token!, createdHome.id, photos);
      console.log('Uploaded photos:', uploadedPhotos);

      navigation.navigate('RegisterWelcome');
    } catch (err) {
      console.log('Create home error:', err);

      if (err instanceof Error && err.message.includes('jwt expired')) {
        setError('Votre session a expiré. Merci de vous reconnecter.');
        return;
      }

      setError(t('auth:somethingWentWrong'));
    }
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
              <Stepper current={4} total={4} />    
              <Text style={styles.sectionTitle}>{t('home:howManyTravelers')}</Text>
              <View style={styles.travelersRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <NumberChip
                        key={n}
                        value={n}
                        selected={travelersCount === n}
                        onPress={() => setTravelersCount(n)}
                    />
                ))}
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
  travelersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  bioInput: {
    minHeight: 48,
    maxHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
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