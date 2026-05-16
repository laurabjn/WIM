import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  carExchangeAccepted: boolean;
  onChangeCarExchangeAccepted: (value: boolean) => void;
};

export function EditHomeRulesTab({
  carExchangeAccepted,
  onChangeCarExchangeAccepted,
}: Props) {
  const { t } = useTranslation('home');

  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>{t('rulesTitle')}</Text>

      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.label}>
            {t('carExchangeAccepted')}
          </Text>
          <Text style={styles.description}>
            {t('carExchangeDescription')}
          </Text>
        </View>

        <Switch
          value={carExchangeAccepted}
          onValueChange={onChangeCarExchangeAccepted}
          trackColor={{ false: '#E5E7EB', true: '#58D6B2' }}
          thumbColor="#FFFFFF"
        />
      </View>
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
});