import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  valeur: Date;
  minimum: Date;
  libelleFin: string;
  onChoisir: (date: Date | undefined) => void;
  onFermer: () => void;
};

export function SelecteurDeDate({
  valeur,
  minimum,
  libelleFin,
  onChoisir,
  onFermer,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);
  const [provisoire, setProvisoire] = useState(valeur);

  if (Platform.OS !== 'ios') {
    return (
      <DateTimePicker
        value={valeur}
        mode="date"
        display="default"
        minimumDate={minimum}
        onChange={(_, choisie) => {
          onFermer();
          onChoisir(choisie);
        }}
      />
    );
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onFermer}>
      <View style={styles.voile}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onFermer}
        />

        <View style={styles.feuille}>
          <DateTimePicker
            value={provisoire}
            mode="date"
            display="spinner"
            minimumDate={minimum}
            onChange={(_, choisie) => {
              if (choisie) setProvisoire(choisie);
            }}
          />

          <TouchableOpacity
            style={styles.valider}
            activeOpacity={0.85}
            onPress={() => {
              onChoisir(provisoire);
              onFermer();
            }}
          >
            <Text style={styles.validerTexte}>{libelleFin}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    voile: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    feuille: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 16,
      paddingBottom: 28,
      paddingTop: 8,
    },
    valider: {
      backgroundColor: c.contrast,
      borderRadius: 999,
      paddingVertical: 14,
      alignItems: 'center',
    },
    validerTexte: {
      color: c.onContrast,
      fontWeight: '700',
    },
  });
