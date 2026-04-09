import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E6E6',
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
    color: '#1F1F1F',
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