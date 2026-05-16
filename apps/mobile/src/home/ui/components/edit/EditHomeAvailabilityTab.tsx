import React from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  row: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
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
    color: '#111111',
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },
  inputLabel: {
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
    backgroundColor: '#FFFFFF',
  },
});