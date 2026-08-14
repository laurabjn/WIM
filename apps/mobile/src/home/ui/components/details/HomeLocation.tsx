import { Home } from '@wim/shared/home/home.type';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  home: Home;
};

export function HomeLocation({ home }: Props) {
  const { t } = useTranslation('home');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('locationSectionTitle')}</Text>

      <View style={styles.locationBox}>
        <Text style={styles.locationTitle}>
          {home.city}, {home.country}
        </Text>

        {home.address ? (
          <Text style={styles.description}>{home.address}</Text>
        ) : (
          <Text style={styles.description}>{t('hiddenAddress')}</Text>
        )}

        {home.latitude && home.longitude ? (
          <Text style={styles.coordinates}>
            {t('coordinates')} : {home.latitude}, {home.longitude}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  section: {
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: c.text,
    marginBottom: 12,
  },
  locationBox: {
    borderRadius: 16,
    backgroundColor: c.surfaceAlt,
    padding: 16,
  },
  locationTitle: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: c.text,
  },
  coordinates: {
    marginTop: 8,
    fontSize: 12,
    color: c.textMuted,
  },
});