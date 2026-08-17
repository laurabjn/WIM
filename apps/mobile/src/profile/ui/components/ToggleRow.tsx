import { useMemo } from 'react';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { TouchableOpacity, StyleSheet, Text } from "react-native";

type ToggleRowProps = {
  label: string;
  value: boolean;
  onPress: () => void;
};

export function ToggleRow({ label, value, onPress }: ToggleRowProps) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <TouchableOpacity
      style={[styles.toggleRow, value && styles.toggleRowSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.toggleRowText, value && styles.toggleRowTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  toggleRow: {
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  toggleRowSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  toggleRowText: {
    fontSize: 14,
    color: c.text,
    fontWeight: '500',
  },
  toggleRowTextSelected: {
    color: c.onContrast,
  },
});