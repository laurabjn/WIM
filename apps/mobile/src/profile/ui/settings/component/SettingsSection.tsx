import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  title: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, children }: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
});