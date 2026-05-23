import { Home } from '@wim/shared/home/home.type';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  home: Home;
};

export function HomeSummary({ home }: Props) {
  const { t } = useTranslation(['home', "profile"]);

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{home.title}</Text>

      <Text style={styles.subtitle}>
        {t('home:entireHome')} · {home.homeType.toLowerCase()} · {home.city}, {home.country}
      </Text>

      <Text style={styles.meta}>
        {home.capacity} {home.capacity > 1 ? t('home:travelers') : t('home:traveler')} ·{' '}
        {home.beds} {home.beds > 1 ? t('profile:beds') : t('profile:bed')} ·{' '}
        {home.bathrooms}{' '}
        {home.bathrooms > 1 ? t('profile:bathrooms') : t('profile:bathroom')}
      </Text>
      
      <Text style={styles.rating}>★ {home.averageRating} · {home.reviewsCount} {t('profile:reviews')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginTop: 10,
  },
});