import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { REGION_DESTINATIONS } from '@wim/shared/src/utils/travelOption';
import { BackButton } from 'src/shared/ui/BackButton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'RegionDestinations'>;

export function RegionDestinationsScreen({ route, navigation }: Props) {
  const { t } = useTranslation('profile');
  const { profile, region, selectedItems } = route.params;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedItems ?? []);

  const allItems = REGION_DESTINATIONS[region] ?? [];

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;

    return allItems.filter((item) =>
      t(`profile:regionDestinations.${region}.${item}`)
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [allItems, search, t, region]);

  const selectedChips = useMemo(() => {
    return allItems.filter((item) => selected.includes(item));
  }, [allItems, selected]);

  const unselectedFilteredChips = useMemo(() => {
    const base = search.trim() ? filteredItems : allItems;

    return base.filter((item) => !selected.includes(item));
  }, [allItems, filteredItems, search, selected]);

  function toggleItem(item: string) {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((value) => value !== item)
        : [...prev, item],
    );
  }

  function handleSubmitSearch() {
    if (filteredItems.length === 0) return;

    const firstMatch = filteredItems[0];

    if (!selected.includes(firstMatch)) {
      setSelected((prev) => [...prev, firstMatch]);
    }

    setSearch('');
  }

  function handleBack() {
    navigation.navigate('Preferences', {
        profile,
        updatedRegionSelection: {
        region,
        selectedItems: selected,
        },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={handleBack} style={styles.headerIconButton} />

          <Text style={styles.headerTitle}>
            {t(`profile:continent.${region}`)}
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <Text style={styles.sectionTitle}>
          {t('profile:preferencesTravel.preferredDestinations')}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {t('profile:preferencesTravel.regionSubtitle')}
        </Text>

        <View style={styles.searchBox}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('profile:regionDestinations.searchPlaceholder')}
            placeholderTextColor="#8D8D8D"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.chipsWrapper}>
          {filteredItems.map((item) => {
            const isSelected = selected.includes(item);

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.destinationChip,
                  isSelected && styles.destinationChipSelected,
                ]}
                onPress={() => toggleItem(item)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.destinationChipText,
                    isSelected && styles.destinationChipTextSelected,
                  ]}
                >
                  {t(`profile:regionDestinations.${region}.${item}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
    color: '#111111',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
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
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  destinationChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  destinationChipSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  destinationChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  destinationChipTextSelected: {
    color: '#FFFFFF',
  },
});