import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomesStackParamList } from 'src/navigation/type/homeStack';
import type { HomeCategory } from '@wim/shared/home/home.type';
import { useTranslation } from 'react-i18next';
import { Home } from '@wim/shared/home/home.type';
import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  createHome,
  getHomeById,
  resolveImageUrl,
  updateHome,
} from '../infrastructure/home.api';
import { HomeTabs } from './components/HomeTabs';
import { EditHomeGeneralTab } from './components/EditHomeGeneralTab';
import { EditHomeDetailsTab } from './components/edit/EditHomeDetailsTab';
import { EditHomeAmenitiesTab } from './components/edit/EditHomeAmenitiesTab';
import { EditHomeRulesTab } from './components/edit/EditHomeRulesTab';
import { EditHomeAvailabilityTab } from './components/edit/EditHomeAvailabilityTab';
import { BackButton } from 'src/shared/ui/BackButton';

type Props = NativeStackScreenProps<HomesStackParamList, 'EditHome'>;

const tabs = ['Général', 'Détails', 'Équipements', 'Règles', 'Disponibilité'];

export const EditHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation("home");
  const { homeId } = route.params ?? {};

  // Le meme ecran sert a creer : sans identifiant, il n'y a rien a charger et
  // l'enregistrement cree au lieu de mettre a jour.
  const isCreating = !homeId;
    
  const [activeTab, setActiveTab] = useState('Général');
  const [home, setHome] = useState<Home | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);

  const [homeType, setHomeType] = useState('HOUSE');
  const [category, setCategory] = useState<HomeCategory | null>(null);
  const [carExchangeAccepted, setCarExchangeAccepted] = useState(false);
  const [isAvailableForExchange, setIsAvailableForExchange] = useState(true);
  const [pricePerNight, setPricePerNight] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
    
  useEffect(() => {
    async function loadHome() {
      try {
        setIsLoading(true);
        setError(null);

        const session = await getSession();

        if (!session?.accessToken) {
          setError('Vous devez être connecté.');
          return;
        }

        setToken(session.accessToken);

        if (isCreating) return;

        const data = await getHomeById(session.accessToken, homeId);

        setHome(data);
        setTitle(data.title ?? '');
        setDescription(data.description ?? '');
        setCapacity(data.capacity ?? 1);
        setBeds(data.beds ?? 1);
        setBathrooms(data.bathrooms ?? 1);
        setAmenities(data.amenities ?? []);
        setHomeType(data.homeType ?? 'HOUSE');
        setCategory(data.category ?? null);
        setCarExchangeAccepted(data.carExchangeAccepted ?? false);
        setIsAvailableForExchange(data.isAvailableForExchange ?? true);
        setPricePerNight(data.pricePerNight ?? null);
      } catch (err) {
        console.log('Load home error:', err);
        setError('Impossible de charger le logement.');
      } finally {
        setIsLoading(false);
      }
    }

    loadHome();
  }, [homeId, isCreating]);
    
  const photos = useMemo(() => {
    return home?.photos
      ?.map((photo) => resolveImageUrl(photo.url))
      .filter(Boolean) as string[] ?? [];
  }, [home]);

  const handleSave = useCallback(async () => {
    if (!token || isSaving) return;
    if (!isCreating && !home) return;

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        capacity,
        beds,
        bathrooms,
        amenities,
        homeType,
        category,
        carExchangeAccepted,
        isAvailableForExchange,
        pricePerNight,
      };

      if (isCreating) {
        const created = await createHome(token, {
          ...payload,
          bedrooms: 1,
          address: '',
          city: '',
          country: '',
        });

        navigation.replace('EditHome', { homeId: created.id });
        return;
      }

      const updatedHome = await updateHome(token, home!.id, payload);

      setHome(updatedHome);
      setTitle(updatedHome.title ?? '');
      setDescription(updatedHome.description ?? '');
      setCapacity(updatedHome.capacity ?? 1);
      setBeds(updatedHome.beds ?? 1);
      setBathrooms(updatedHome.bathrooms ?? 1);
      setAmenities(updatedHome.amenities ?? []);
      setHomeType(updatedHome.homeType ?? 'HOUSE');
      setCategory(updatedHome.category ?? null);
      setCarExchangeAccepted(updatedHome.carExchangeAccepted ?? false);
      setIsAvailableForExchange(updatedHome.isAvailableForExchange ?? true);
      setPricePerNight(updatedHome.pricePerNight ?? null);
    } catch (err) {
      console.log(isCreating ? 'Create home error:' : 'Update home error:', err);

      setError(
        isCreating
          ? 'Impossible de créer le logement.'
          : 'Impossible de mettre à jour le logement.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    token,
    home,
    isCreating,
    navigation,
    isSaving,
    title,
    description,
    capacity,
    beds,
    bathrooms,
    amenities,
    homeType,
    category,
    carExchangeAccepted,
    isAvailableForExchange,
    pricePerNight,
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!token || isSaving) return;
      if (!isCreating && !home) return;
      // Quitter un formulaire de creation reste vide ne doit rien creer.
      if (isCreating && !title.trim()) return;

      event.preventDefault();

      handleSave().finally(() => {
        navigation.dispatch(event.data.action);
      });
    });

    return unsubscribe;
  }, [navigation, home, token, isSaving, isCreating, title, handleSave]);
 
  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error || (!isCreating && !home)) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error ?? t('home.not_found')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

          <Text style={styles.headerTitle}>{t('editHomePage')}</Text>

          <View style={styles.headerSpacer} />
        </View>
              
        <HomeTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'Général' && (
          <EditHomeGeneralTab
            title={title}
            description={description}
            photos={photos}
            onChangeTitle={setTitle}
            onChangeDescription={setDescription}
          />
        )}

        {activeTab === 'Détails' && (
          <EditHomeDetailsTab
            capacity={capacity}
            beds={beds}
            bathrooms={bathrooms}
            homeType={homeType}
            category={category}
            onChangeCapacity={setCapacity}
            onChangeBeds={setBeds}
            onChangeBathrooms={setBathrooms}
            onChangeHomeType={setHomeType}
            onChangeCategory={setCategory}
          />
        )}

        {activeTab === 'Équipements' && (
          <EditHomeAmenitiesTab
            amenities={amenities}
            onChangeAmenities={setAmenities}
          />
        )}

        {activeTab === 'Règles' && (
          <EditHomeRulesTab
            carExchangeAccepted={carExchangeAccepted}
            onChangeCarExchangeAccepted={setCarExchangeAccepted}
          />
        )}

        {activeTab === 'Disponibilité' && (
          <EditHomeAvailabilityTab
            isAvailableForExchange={isAvailableForExchange}
            pricePerNight={pricePerNight}
            onChangeIsAvailableForExchange={setIsAvailableForExchange}
            onChangePricePerNight={setPricePerNight}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },

  tabPlaceholder: {
    paddingHorizontal: 12,
    paddingTop: 24,
  },

  emptyPhotos: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyPhotosText: {
    color: '#6B7280',
    fontSize: 13,
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 32,
  },

  header: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 18,
    color: '#111111',
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },

  headerSpacer: {
    width: 34,
  },

  tabsContent: {
    paddingHorizontal: 10,
    gap: 8,
    marginTop: 8,
    marginBottom: 18,
  },

  tab: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTab: {
    backgroundColor: '#58D6B2',
  },

  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111111',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  form: {
    paddingHorizontal: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#111111',
    marginBottom: 18,
  },

  textarea: {
    minHeight: 145,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#111111',
    marginBottom: 18,
  },

  photosGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  largePhoto: {
    flex: 1,
    height: 185,
    borderRadius: 12,
  },

  smallPhotosColumn: {
    width: 118,
    gap: 8,
  },

  smallPhoto: {
    width: '100%',
    height: 88.5,
    borderRadius: 12,
  },

  fullPhoto: {
    width: '100%',
    height: 245,
    borderRadius: 12,
  },
});