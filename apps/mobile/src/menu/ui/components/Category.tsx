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
        colors={[eclaircir(color, 0.72), color, assombrir(color, 0.22)]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.categoryIcon}
      >
        {icon}
      </LinearGradient>

      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function canaux(hex: string): [number, number, number] {
  const abrege = hex.replace('#', '');
  const valeur =
    abrege.length === 3
      ? abrege
          .split('')
          .map((caractere) => caractere + caractere)
          .join('')
      : abrege.padEnd(6, '0');

  return [0, 2, 4].map(
    (position) => parseInt(valeur.slice(position, position + 2), 16) || 0,
  ) as [number, number, number];
}

function eclaircir(hex: string, force: number): string {
  const teintes = canaux(hex).map((composante) =>
    Math.round(composante + (255 - composante) * force),
  );

  return `rgb(${teintes.join(', ')})`;
}

function assombrir(hex: string, force: number): string {
  const teintes = canaux(hex).map((composante) =>
    Math.round(composante * (1 - force)),
  );

  return `rgb(${teintes.join(', ')})`;
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
