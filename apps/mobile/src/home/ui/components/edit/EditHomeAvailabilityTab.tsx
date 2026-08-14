import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  isAvailableForExchange: boolean;
  pricePerNight: number | null;
  onChangeIsAvailableForExchange: (value: boolean) => void;
  onChangePricePerNight: (value: number | null) => void;
};

export function EditHomeAvailabilityTab({
  isAvailableForExchange,
  pricePerNight,
  onChangeIsAvailableForExchange,
  onChangePricePerNight,
}: Props) {
  const { t } = useTranslation('home');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>
        {t('availabilityTitle', 'Disponibilité')}
      </Text>

      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.label}>
            {t('availableForExchange', 'Disponible pour échange')}
          </Text>
          <Text style={styles.description}>
            {t(
              'availableForExchangeDescription',
              'Affiche ce logement comme disponible pour les autres utilisateurs.',
            )}
          </Text>
        </View>

        <Switch
          value={isAvailableForExchange}
          onValueChange={onChangeIsAvailableForExchange}
          trackColor={{ false: '#E5E7EB', true: '#58D6B2' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Text style={styles.inputLabel}>
        {t('pricePerNight', 'Prix indicatif par nuit')}
      </Text>

      <TextInput
        value={pricePerNight === null ? '' : String(pricePerNight)}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '');
          onChangePricePerNight(cleaned ? Number(cleaned) : null);
        }}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#C9C9C9"
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 12,
  },
  row: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: c.textMuted,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    fontSize: 13,
    color: c.text,
    backgroundColor: c.surface,
  },
});