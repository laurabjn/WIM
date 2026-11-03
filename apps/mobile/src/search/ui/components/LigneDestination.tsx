import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { getCityImagesApi } from 'src/utils/cityImages';

const TAILLE_VIGNETTE = 48;

type Props = {
  titre: string;
  sousTitre: string;
  ville?: string;
  pays?: string;
  icone?: React.ReactNode;
  fondIcone?: string;
  onPress: () => void;
};

export function LigneDestination({
  titre,
  sousTitre,
  ville,
  pays,
  icone,
  fondIcone,
  onPress,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [vignette, setVignette] = useState<string | null>(null);

  useEffect(() => {
    if (icone || !ville) return;

    let abandonne = false;

    getCityImagesApi(ville, pays ?? '', 1).then((images) => {
      if (!abandonne && images[0]?.url) setVignette(images[0].url);
    });

    return () => {
      abandonne = true;
    };
  }, [icone, ville, pays]);

  return (
    <TouchableOpacity style={styles.ligne} onPress={onPress} activeOpacity={0.7}>
      {icone ? (
        <View style={[styles.vignette, styles.vignetteIcone, fondIcone ? { backgroundColor: fondIcone } : null]}>
          {icone}
        </View>
      ) : vignette ? (
        <Image source={{ uri: vignette }} style={styles.vignette} />
      ) : (
        <View style={[styles.vignette, styles.vignetteVide]} />
      )}

      <View style={styles.textes}>
        <Text style={styles.titre} numberOfLines={1}>
          {titre}
        </Text>

        <Text style={styles.sousTitre} numberOfLines={1}>
          {sousTitre}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },

    vignette: {
      width: TAILLE_VIGNETTE,
      height: TAILLE_VIGNETTE,
      borderRadius: 12,
    },

    vignetteIcone: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    vignetteVide: {
      backgroundColor: c.surfaceAlt,
    },

    textes: {
      flex: 1,
    },

    titre: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },

    sousTitre: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 2,
    },
  });
