import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { LucideProps } from 'lucide-react-native';

const COULEUR_DANGER = '#E53935';

type Props = {
  label: string;
  icon?: React.ComponentType<LucideProps>;
  onPress: () => void;
};

export function SettingsDangerRow({
  label,
  icon: Icone,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <View style={styles.icon}>
          {Icone ? <Icone size={18} strokeWidth={1.8} color={COULEUR_DANGER} /> : null}
        </View>
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
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: COULEUR_DANGER,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 16,
    color: COULEUR_DANGER,
  },
});