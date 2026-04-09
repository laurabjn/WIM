import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type Props = {
  label: string;
  icon?: string;
  onPress: () => void;
};

export function SettingsDangerRow({
  label,
  icon = '!',
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
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
    borderBottomColor: '#F0D3D3',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 18,
    textAlign: 'center',
    fontSize: 15,
    color: '#E53935',
  },
  label: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 16,
    color: '#E53935',
  },
});