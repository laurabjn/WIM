import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AMENITIES } from '@wim/shared/utils/amenities';

type Props = {
  amenities: string[];
  onChangeAmenities: (value: string[]) => void;
};

export function EditHomeAmenitiesTab({ amenities, onChangeAmenities }: Props) {
  const { t } = useTranslation('home');

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

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
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
    borderColor: '#E6E6E6',
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  amenityCardSelected: {
    borderColor: '#58D6B2',
    backgroundColor: '#EFFFF9',
  },
  amenityIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  amenityTextSelected: {
    color: '#159B76',
  },
});