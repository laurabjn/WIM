import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  label: string;
  value?: string;
  icon?: string;
  onPress?: () => void;
  hideArrow?: boolean;
  valueColor?: string;
};

export function SettingsRow({
  label,
  value,
  icon = '•',
  onPress,
  hideArrow = false,
  valueColor = '#6B6B6B',
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.right}>
        {value ? <Text style={[styles.value, { color: valueColor }]}>{value}</Text> : null}
        {!hideArrow && <Text style={styles.arrow}>→</Text>}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 18,
    textAlign: 'center',
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    color: c.text,
    flexShrink: 1,
  },
  value: {
    fontSize: 13,
  },
  arrow: {
    fontSize: 16,
    color: '#7A7A7A',
  },
});