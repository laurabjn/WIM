import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  exchangesCount: number;
  reviewsCount: number;
  homesCount: number;
};

export function ProfileStatsRow({
  exchangesCount,
  reviewsCount,
  homesCount,
}: Props) {
  const { t } = useTranslation('profile');

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.value}>{exchangesCount}</Text>
        <Text style={styles.label}>{t('exchange')}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.value}>{reviewsCount}</Text>
        <Text style={styles.label}>{t('reviews')}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.value}>{homesCount}</Text>
        <Text style={styles.label}>{t('homes')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 14,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});