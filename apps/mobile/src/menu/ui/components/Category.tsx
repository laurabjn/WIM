import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={[eclaircir(color), color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoryIcon}
      >
        {icon}
      </LinearGradient>

      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function eclaircir(hex: string): string {
  const valeur = hex.replace('#', '');
  const canal = (position: number) => parseInt(valeur.slice(position, position + 2), 16);
  const clair = (composante: number) => Math.round(composante + (255 - composante) * 0.35);

  return `rgb(${clair(canal(0))}, ${clair(canal(2))}, ${clair(canal(4))})`;
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
