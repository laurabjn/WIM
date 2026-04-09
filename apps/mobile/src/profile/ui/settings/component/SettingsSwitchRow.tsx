import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

type Props = {
  label: string;
  icon?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingsSwitchRow({
  label,
  icon = '•',
  value,
  onValueChange,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Switch value={value} onValueChange={onValueChange} />
    </View>
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
});