import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import type { LucideProps } from 'lucide-react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  label: string;
  icon?: React.ComponentType<LucideProps>;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingsSwitchRow({
  label,
  icon: Icone,
  value,
  onValueChange,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.icon}>
          {Icone ? <Icone size={18} strokeWidth={1.8} color={themeColors.text} /> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.interrupteur}>
        <Switch value={value} onValueChange={onValueChange} />
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  row: {
    minHeight: 56,
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
  interrupteur: {
    height: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
});