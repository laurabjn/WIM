import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
    CONTINENTS,
    ESSENTIAL_AMENITIES,
    ENVIRONMENTS,
    HOME_TYPES,
    SEASONS,
    STAY_DURATIONS
} from '@wim/shared/src/utils/travelOption';
import { ChoiceChip } from './components/ChoiceChip';
import { NumberChip } from './components/NumberChip';
import { ToggleRow } from './components/ToggleRow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UserProfile } from '@wim/shared';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { useTranslation } from 'react-i18next';
import { StayDurationSlider } from './components/StayDurationSlider';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Preferences'>;

export function PreferencesScreen({ route, navigation }: Props) {
  const { t } = useTranslation(['profile', 'auth']);
  const { profile } = route.params;

  const initialPreferences = profile.travelPreferences ?? {
    preferredCountries: [],
    preferredHomeTypes: [],
    minCapacity: null,
    maxCapacity: null,
    carExchangeAccepted: null,
    flexibleDates: null,
    preferredCities: [],
    preferredContinents: [],
    stayDuration: null,
    preferredSeasons: [],
    essentialAmenities: [],
    preferredEnvironments: [],
    travelersCount: 3,
    travelingWithChildren: false,
    petsAccepted: false,
  };

  const [isSaving, setIsSaving] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [preferredContinents, setPreferredContinents] = useState<string[]>(
    initialPreferences.preferredContinents ?? [],
  );
  const [preferredHomeTypes, setPreferredHomeTypes] = useState<string[]>(
    initialPreferences.preferredHomeTypes ?? [],
  );
  const [stayDuration, setStayDuration] = useState<string>(
    initialPreferences.stayDuration ?? '2m',
  );
  const [preferredSeasons, setPreferredSeasons] = useState<string[]>(
    initialPreferences.preferredSeasons ?? [],
  );
  const [essentialAmenities, setEssentialAmenities] = useState<string[]>(
    initialPreferences.essentialAmenities ?? [],
  );
  const [preferredEnvironments, setPreferredEnvironments] = useState<string[]>(
    initialPreferences.preferredEnvironments ?? [],
  );
  const [travelersCount, setTravelersCount] = useState<number>(
    initialPreferences.travelersCount ?? 1,
  );
  const [travelingWithChildren, setTravelingWithChildren] = useState<boolean>(
    initialPreferences.travelingWithChildren ?? false,
  );
  const [petsAccepted, setPetsAccepted] = useState<boolean>(
    initialPreferences.petsAccepted ?? false,
  );

  function toggleItem(
    key: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    if (list.includes(key)) {
      setter(list.filter((item) => item !== key));
    } else {
      setter([...list, key]);
    }
  }
    
  async function handleSave() {
    try {
      setIsSaving(true);
      const updatedProfile: UserProfile = {
        ...profile,
        travelPreferences: {
          ...profile.travelPreferences,
          preferredCountries: profile.travelPreferences.preferredCountries ?? [],
          preferredHomeTypes,
          minCapacity: travelersCount,
          maxCapacity: travelersCount,
          carExchangeAccepted: profile.travelPreferences.carExchangeAccepted ?? null,
          flexibleDates: profile.travelPreferences.flexibleDates ?? null,
          preferredCities: searchCity ? [searchCity] : [],
          preferredContinents,
          stayDuration,
          preferredSeasons,
          essentialAmenities,
          preferredEnvironments,
          travelersCount,
          travelingWithChildren,
          petsAccepted,
        },
      };

      console.log('PREFERENCES TO SAVE:', updatedProfile.travelPreferences);
      navigation.goBack();
    } catch (error) {
      console.log('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  }

  const getStayDurationLabel = (value: string) =>
    t(`profile:stayDuration.${value}`);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>{t('profile:preferencesTravel.title')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('profile:preferencesTravel.subtitle')}
        </Text>

        <View style={styles.searchBox}>
          <TextInput
            value={searchCity}
            onChangeText={setSearchCity}
            placeholder={t('profile:preferencesTravel.search')}
            placeholderTextColor="#8D8D8D"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.grid}>
          {CONTINENTS.map((item) => (
            <ChoiceChip
              key={item}
              label={t(`profile:continent.${item}`)}
              selected={preferredContinents.includes(item)}
              onPress={() =>
                toggleItem(item, preferredContinents, setPreferredContinents)
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('auth:register.housingType')}</Text>
        <View style={styles.smallGrid}>
          {HOME_TYPES.map((item) => (
            <ChoiceChip
              key={item}
              label={t(`profile:homeType.${item}`)}
              selected={preferredHomeTypes.includes(item)}
              onPress={() =>
                toggleItem(item, preferredHomeTypes, setPreferredHomeTypes)
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>
            {t('profile:preferencesTravel.lengthOfStay')}
        </Text>

        <StayDurationSlider
            value={stayDuration}
            onChange={setStayDuration}
            options={STAY_DURATIONS}
            getLabel={getStayDurationLabel}
        />

        <Text style={styles.sectionTitle}>{t('profile:preferencesTravel.timeOfYear')}</Text>
        <View style={styles.grid}>
          {SEASONS.map((item) => (
            <ChoiceChip
              key={item}
              label={t(`profile:season.${item}`)}
              selected={preferredSeasons.includes(item)}
              onPress={() =>
                toggleItem(item, preferredSeasons, setPreferredSeasons)
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('profile:preferencesTravel.equipments')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('profile:preferencesTravel.equipmentsSubtitle')}
        </Text>

        <View style={styles.smallGrid}>
          {ESSENTIAL_AMENITIES.map((item) => (
            <ChoiceChip
              key={item}
              label={t(`profile:essentialAmenities.${item}`)}
              selected={essentialAmenities.includes(item)}
              onPress={() =>
                toggleItem(item, essentialAmenities, setEssentialAmenities)
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('profile:preferencesTravel.typeOfEnvironment')}</Text>
        <View style={styles.smallGrid}>
          {ENVIRONMENTS.map((item) => (
            <ChoiceChip
              key={item}
              label={t(`profile:environments.${item}`)}
              selected={preferredEnvironments.includes(item)}
              onPress={() =>
                toggleItem(item, preferredEnvironments, setPreferredEnvironments)
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('profile:preferencesTravel.numberOfTravelers')}</Text>
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

        <Text style={styles.sectionTitle}>{t('profile:preferencesTravel.additionalOptions')}</Text>
        <ToggleRow
          label={t('profile:preferencesTravel.travelingWithChildren')}
          value={travelingWithChildren}
          onPress={() => setTravelingWithChildren((prev) => !prev)}
        />
        <ToggleRow
          label={t('profile:preferencesTravel.petsAccepted')}
          value={petsAccepted}
          onPress={() => setPetsAccepted((prev) => !prev)}
        />

        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>
              {isSaving
                ? t('profile:preferencesTravel.savingInProgress')
                : t('profile:preferencesTravel.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    marginTop: 10,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 14,
    lineHeight: 18,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  searchInput: {
    height: 46,
    fontSize: 14,
    color: '#1F1F1F',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  smallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  durationLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  durationEdgeLabel: {
    fontSize: 11,
    color: '#A1A1A1',
  },
  durationCenterLabel: {
    fontSize: 13,
    color: '#1F1F1F',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  travelersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  saveButtonWrapper: {
    marginTop: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#111111',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});