import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { LucideProps } from 'lucide-react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  label: string;
  value?: string;
  icon?: React.ComponentType<LucideProps>;
  onPress?: () => void;
  hideArrow?: boolean;
  valueColor?: string;
};

export function SettingsRow({
  label,
  value,
  icon: Icone,
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
        <View style={styles.icon}>
          {Icone ? <Icone size={18} strokeWidth={1.8} color={themeColors.text} /> : null}
        </View>
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
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: c.textMuted,
  },
});