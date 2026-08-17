import { useMemo } from 'react';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { TouchableOpacity, StyleSheet, Text } from "react-native";

type ChoiceChipProps = {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoiceChip({ label, subtitle, selected, onPress }: ChoiceChipProps) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <TouchableOpacity
      style={[styles.choiceChip, selected && styles.choiceChipSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.choiceChipLabel, selected && styles.choiceChipLabelSelected]}>
        {label}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.choiceChipSubtitle,
            selected && styles.choiceChipSubtitleSelected,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  choiceChip: {
    minWidth: '47%',
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceChipSelected: {
    backgroundColor: '#4ECC9A',
    borderColor: '#4ECC9A',
  },
  choiceChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
    textAlign: 'center',
  },
  choiceChipLabelSelected: {
    color: c.onContrast,
  },
  choiceChipSubtitle: {
    fontSize: 11,
    color: c.textMuted,
    marginTop: 4,
  },
  choiceChipSubtitleSelected: {
    color: '#EAFBF4',
  },
});