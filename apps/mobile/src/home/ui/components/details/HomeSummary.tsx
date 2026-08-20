import { Home } from '@wim/shared/home/home.type';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  home: Home;
  onPressReviews?: () => void;
};

export function HomeSummary({ home, onPressReviews }: Props) {
  const { t } = useTranslation(['home', "profile"]);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{home.title}</Text>

      <Text style={styles.subtitle}>
        {t('home:entireHome')} · {t(`home:homeTypes.${home.homeType.toLowerCase()}`)} · {home.city}, {home.country}
      </Text>

      <Text style={styles.meta}>
        {home.capacity} {home.capacity > 1 ? t('home:travelers') : t('home:traveler')} ·{' '}
        {home.beds} {home.beds > 1 ? t('profile:beds') : t('profile:bed')} ·{' '}
        {home.bathrooms}{' '}
        {home.bathrooms > 1 ? t('profile:bathrooms') : t('profile:bathroom')}
      </Text>
      
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressReviews}
      >
        <Text style={styles.rating}>
          ★ {home.averageRating} · {home.reviewsCount}{' '}
          {t('profile:reviews')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: c.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: c.textMuted,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: c.textMuted,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
    marginTop: 10,
  },
});