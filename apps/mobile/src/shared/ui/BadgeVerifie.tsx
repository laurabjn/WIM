import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  verifie?: boolean;
  avecLibelle?: boolean;
  taille?: number;
};

export function BadgeVerifie({
  verifie,
  avecLibelle = false,
  taille = 16,
}: Props) {
  const { t } = useTranslation(['profile']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  if (!verifie) return null;

  const libelle = t('profile:identityVerified');

  return (
    <View
      style={styles.bloc}
      accessibilityRole="image"
      accessibilityLabel={libelle}
    >
      <BadgeCheck size={taille} color={themeColors.info} />

      {avecLibelle ? <Text style={styles.libelle}>{libelle}</Text> : null}
    </View>
  );
}

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bloc: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    libelle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.info,
    },
  });
