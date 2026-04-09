import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

type Props = {
  label: string;
  icon?: string;
  onPress: () => void;
};

export function ProfileMenuItem({ label, icon = '•', onPress }: Props) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 16,
    width: 18,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#1F1F1F',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
});