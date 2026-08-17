import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
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
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { useTranslation } from 'react-i18next';
import { StayDurationSlider } from './components/StayDurationSlider';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { updateMyProfile } from '../infrastructure/profile.api';
import { LinearGradient } from 'expo-linear-gradient';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Preferences'>;

export function PreferencesScreen({ route, navigation }: Props) {
  const { t } = useTranslation(['profile', 'auth']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const profileRef = useRef(route.params.profile);
  const profile = profileRef.current;

  const initialPreferences = profile.travelPreferences ?? {
    preferredCountries: [],
    preferredHomeTypes: [],
    minCapacity: null,
    maxCapacity: null,
    carExchangeAccepted: null,
    flexibleDates: null,
    preferredCities: [],
    preferredContinents: [],
    preferredDestinationsByRegion: {},
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
  const [preferredDestinationsByRegion, setPreferredDestinationsByRegion] =
    useState<Record<string, string[]>>(
      initialPreferences.preferredDestinationsByRegion ?? {},
    );
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

  useEffect(() => {
    const updatedSelection = route.params?.updatedRegionSelection;

    if (!updatedSelection) return;

    setPreferredDestinationsByRegion((prev) => ({
      ...prev,
      [updatedSelection.region]: updatedSelection.selectedItems,
    }));
  }, [route.params?.updatedRegionSelection]);

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

      const session = await getSession();

      if (!session?.accessToken) {
        throw new Error('Missing token');
      }

      const updatedProfile = await updateMyProfile(session.accessToken, {
        travelPreferences: {
          ...profile.travelPreferences,
          preferredCountries: profile.travelPreferences.preferredCountries ?? [],
          preferredHomeTypes,
          minCapacity: travelersCount,
          maxCapacity: travelersCount,
          carExchangeAccepted: profile.travelPreferences.carExchangeAccepted ?? null,
          flexibleDates: profile.travelPreferences.flexibleDates ?? null,
          preferredCities: searchCity ? [searchCity] : [],
          preferredContinents: Object.keys(preferredDestinationsByRegion).filter(
            (region) => (preferredDestinationsByRegion[region]?.length ?? 0) > 0,
          ),
          preferredDestinationsByRegion,
          stayDuration,
          preferredSeasons,
          essentialAmenities,
          preferredEnvironments,
          travelersCount,
          travelingWithChildren,
          petsAccepted,
        },
      });

      console.log(
        'UPDATED PROFILE FROM API:',
        JSON.stringify(updatedProfile, null, 2),
      );
      console.log(
        'UPDATED DESTINATIONS BY REGION:',
        JSON.stringify(
          updatedProfile.travelPreferences?.preferredDestinationsByRegion,
          null,
          2,
        ),
      );
      navigation.navigate('ProfileMain', {
        updatedProfile,
      });
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
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} style={styles.headerIconButton} />

          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>
              {t('profile:preferencesTravel.title')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('profile:preferencesTravel.preferredDestinations')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('profile:preferencesTravel.subtitle')}
        </Text>

        <View style={styles.grid}>
          {CONTINENTS.map((item) => {
            const selectedCount =
              preferredDestinationsByRegion[item]?.length ?? 0;

            const isSelected = selectedCount > 0;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.regionCard,
                  isSelected && styles.regionCardSelected,
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('RegionDestinations', {
                    profile,
                    region: item,
                    selectedItems: preferredDestinationsByRegion[item] ?? [],
                  })
                }
              >
                <Text
                  style={[
                    styles.regionCardTitle,
                    isSelected && styles.regionCardTitleSelected,
                  ]}
                >
                  {t(`profile:continent.${item}`)}
                </Text>

                {isSelected ? (
                  <Text style={styles.regionCardSubtitleSelected}>
                    {selectedCount} {t('profile:preferencesTravel.selectedItems')}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
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
            <LinearGradient
              colors={['#52D1A6', '#2DA7F3']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryButton}
            >
              <Text style={styles.saveButtonText}>
                {isSaving
                  ? t('profile:preferencesTravel.savingInProgress')
                  : t('profile:preferencesTravel.save')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },
  screen: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
    color: c.text,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
    marginTop: 10,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: c.textMuted,
    marginBottom: 14,
    lineHeight: 18,
  },
  searchBox: {
    backgroundColor: c.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  searchInput: {
    height: 46,
    fontSize: 14,
    color: c.text,
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
  regionCard: {
    minWidth: '47%',
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionCardSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  regionCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
    textAlign: 'center',
  },
  regionCardTitleSelected: {
    color: c.onContrast,
  },
  regionCardSubtitleSelected: {
    fontSize: 11,
    color: '#EAFBF4',
    marginTop: 4,
  },
  durationLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  durationEdgeLabel: {
    fontSize: 11,
    color: c.textMuted,
  },
  durationCenterLabel: {
    fontSize: 13,
    color: c.text,
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
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: c.onContrast,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});