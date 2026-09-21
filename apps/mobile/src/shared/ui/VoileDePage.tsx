import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from 'src/theme/ThemeContext';

type Props = {
  haut?: boolean;
  bas?: boolean;
};

const HAUTEUR_BARRE = 68;
const FONDU = 40;

export function VoileDePage({ haut = false, bas = true }: Props) {
  const insets = useSafeAreaInsets();
  const { surface } = useThemeColors();

  const transparent = `${surface}00`;

  return (
    <>
      {haut ? (
        <LinearGradient
          pointerEvents="none"
          colors={[surface, transparent]}
          style={[styles.haut, { height: insets.top + FONDU }]}
        />
      ) : null}

      {bas ? (
        <LinearGradient
          pointerEvents="none"
          colors={[transparent, surface]}
          style={[styles.bas, { height: HAUTEUR_BARRE + insets.bottom + FONDU }]}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  haut: { position: 'absolute', top: 0, left: 0, right: 0 },
  bas: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
