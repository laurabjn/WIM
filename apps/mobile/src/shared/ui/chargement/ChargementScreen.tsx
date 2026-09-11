import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LogoEvolutif } from './LogoEvolutif';

type Props = {
  onFin: () => void;
};

export function ChargementScreen({ onFin }: Props) {
  return (
    <View style={styles.ecran}>
      <LogoEvolutif depart="monogramme" onFin={onFin} />
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
