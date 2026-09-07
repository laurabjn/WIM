import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_CATEGORIES, HOME_TYPES } from '@wim/shared/src/utils/travelOption';
import type { HomeCategory } from '@wim/shared/home/home.type';
import { CounterRow } from '../CounterRow';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

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
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

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



const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  hint: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 17,
    color: c.textMuted,
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
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
  },
  chipSelected: {
    backgroundColor: '#58D6B2',
    borderColor: '#58D6B2',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: c.text,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});