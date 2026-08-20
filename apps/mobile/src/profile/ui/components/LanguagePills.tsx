import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  languages?: string[];
};

export function LanguagePills({ languages = [] }: Props) {
  const { t } = useTranslation('profile');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  if (!Array.isArray(languages) || languages.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {languages.map((language) => (
        <View key={language} style={styles.pill}>
          <Text style={styles.pillText}>{t(`profile:language.${language}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  pill: {
    backgroundColor: c.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 12,
    color: c.textMuted,
  },
});