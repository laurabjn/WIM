import { useMemo } from 'react';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { TouchableOpacity, StyleSheet, Text } from "react-native";

type NumberChipProps = {
  value: number;
  selected: boolean;
  onPress: () => void;
};

export function NumberChip({ value, selected, onPress }: NumberChipProps) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <TouchableOpacity
      style={[styles.numberChip, selected && styles.numberChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.numberChipText, selected && styles.numberChipTextSelected]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  numberChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberChipSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  numberChipText: {
    fontSize: 14,
    color: c.text,
    fontWeight: '600',
  },
  numberChipTextSelected: {
    color: c.onContrast,
  },
});