import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  description?: string | null;
};

export function HomeDescription({ description }: Props) {
  const { t } = useTranslation('home');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('description')}</Text>

      <Text style={styles.description}>
        {description || t('noDescription')}
      </Text>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  section: {
    paddingHorizontal: 18,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: '700',
    color: c.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: c.text,
  },
});