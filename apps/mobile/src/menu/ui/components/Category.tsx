import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

export function Category({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <TouchableOpacity style={styles.category} onPress={onPress}>
      <View style={[styles.categoryIcon, { backgroundColor: color }]}>
        {icon}
      </View>

      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    category: {
      alignItems: 'center',
      width: 72,
    },
    categoryIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    categoryLabel: {
      color: c.text,
      fontSize: 11,
      fontWeight: '600',
    },
  });
