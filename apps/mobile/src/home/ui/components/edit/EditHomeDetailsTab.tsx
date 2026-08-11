import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_CATEGORIES, HOME_TYPES } from '@wim/shared/src/utils/travelOption';
import type { HomeCategory } from '@wim/shared/home/home.type';
import { CounterRow } from '../CounterRow';

type Props = {
  capacity: number;
  beds: number;
  bathrooms: number;
  homeType: string;
  category: HomeCategory | null;
  onChangeCapacity: (value: number) => void;
  onChangeBeds: (value: number) => void;
  onChangeBathrooms: (value: number) => void;
  onChangeHomeType: (value: string) => void;
  onChangeCategory: (value: HomeCategory | null) => void;
};

export function EditHomeDetailsTab({
  capacity,
  beds,
  bathrooms,
  homeType,
  category,
  onChangeCapacity,
  onChangeBeds,
  onChangeBathrooms,
  onChangeHomeType,
  onChangeCategory,
}: Props) {
  const { t } = useTranslation(['home', "profile"]);

  return (
    <View style={styles.form}>
      <Text style={styles.label}>{t('home:homeType')}</Text>

      <View style={styles.chipsRow}>
        {HOME_TYPES.map((type) => {
          const selected = homeType === type;

          return (
            <TouchableOpacity
              key={type}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChangeHomeType(type)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {t(`profile:homeType.${type}`, type)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>{t('home:category')}</Text>

      <Text style={styles.hint}>{t('home:categoryHint')}</Text>

      <View style={styles.chipsRow}>
        {HOME_CATEGORIES.map((value) => {
          const selected = category === value;

          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, selected && styles.chipSelected]}
              // Retaper le theme actif le retire : un logement peut n'en avoir aucun.
              onPress={() => onChangeCategory(selected ? null : value)}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {t(`home:categories.${value}`, value)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CounterRow
        label={t('home:capacity')}
        value={capacity}
        onChange={onChangeCapacity}
      />

      <CounterRow
        label={t('home:beds')}
        value={beds}
        onChange={onChangeBeds}
      />

      <CounterRow
        label={t('home:bathrooms')}
        value={bathrooms}
        onChange={onChangeBathrooms}
      />
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
    marginBottom: 8,
  },
  hint: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#58D6B2',
    borderColor: '#58D6B2',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});