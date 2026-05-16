import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_TYPES } from '@wim/shared/src/utils/travelOption';
import { CounterRow } from '../CounterRow';

type Props = {
  capacity: number;
  beds: number;
  bathrooms: number;
  homeType: string;
  onChangeCapacity: (value: number) => void;
  onChangeBeds: (value: number) => void;
  onChangeBathrooms: (value: number) => void;
  onChangeHomeType: (value: string) => void;
};

export function EditHomeDetailsTab({
  capacity,
  beds,
  bathrooms,
  homeType,
  onChangeCapacity,
  onChangeBeds,
  onChangeBathrooms,
  onChangeHomeType,
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