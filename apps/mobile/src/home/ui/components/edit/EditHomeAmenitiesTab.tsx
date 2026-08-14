import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AMENITIES } from '@wim/shared/utils/amenities';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  amenities: string[];
  onChangeAmenities: (value: string[]) => void;
};

export function EditHomeAmenitiesTab({ amenities, onChangeAmenities }: Props) {
  const { t } = useTranslation('home');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  function toggleAmenity(amenity: string) {
    if (amenities.includes(amenity)) {
      onChangeAmenities(amenities.filter((item) => item !== amenity));
      return;
    }

    onChangeAmenities([...amenities, amenity]);
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>{t('amenitiesTitle')}</Text>

      <View style={styles.grid}>
        {AMENITIES.map((amenity) => {
          const selected = amenities.includes(amenity);

          return (
            <TouchableOpacity
              key={amenity}
              style={[styles.amenityCard, selected && styles.amenityCardSelected]}
              onPress={() => toggleAmenity(amenity)}
            >
              <Text style={styles.amenityIcon}>{selected ? '✓' : '+'}</Text>
              <Text style={[styles.amenityText, selected && styles.amenityTextSelected]}>
                {t(`amenities.${amenity}`, amenity)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityCard: {
    width: '48%',
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: c.surface,
  },
  amenityCardSelected: {
    borderColor: '#58D6B2',
    backgroundColor: '#EFFFF9',
  },
  amenityIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
  },
  amenityTextSelected: {
    color: '#159B76',
  },
});