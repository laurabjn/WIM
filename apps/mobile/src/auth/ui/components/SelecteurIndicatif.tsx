import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import {
  COUNTRY_DIAL_CODES,
  COUNTRY_OPTIONS,
  drapeauDepuisIso,
} from '@wim/shared/utils/locationOptions';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  indicatif: string;
  onChoisir: (indicatif: string) => void;
};

export function SelecteurIndicatif({ indicatif, onChoisir }: Props) {
  const { t } = useTranslation(['auth']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);
  const [ouvert, setOuvert] = useState(false);

  const pays = COUNTRY_OPTIONS.map((cle) => ({
    cle,
    ...COUNTRY_DIAL_CODES[cle],
  }));

  const choisi = pays.find((option) => option.dial === indicatif) ?? pays[0];

  return (
    <>
      <TouchableOpacity
        style={styles.bouton}
        activeOpacity={0.8}
        onPress={() => setOuvert(true)}
        accessibilityRole="button"
        accessibilityLabel={t('auth:register.phonePrefix')}
      >
        <Text style={styles.drapeau}>{drapeauDepuisIso(choisi.iso)}</Text>
        <Text style={styles.indicatif}>{choisi.dial}</Text>
        <ChevronDown size={16} color={themeColors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={ouvert}
        transparent
        animationType="fade"
        onRequestClose={() => setOuvert(false)}
      >
        <View style={styles.voile}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setOuvert(false)}
          />

          <View style={styles.feuille}>
            <Text style={styles.titre}>{t('auth:register.phonePrefix')}</Text>

            <FlatList
              data={pays}
              keyExtractor={(option) => option.cle}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.ligne}
                  activeOpacity={0.7}
                  onPress={() => {
                    onChoisir(item.dial);
                    setOuvert(false);
                  }}
                >
                  <Text style={styles.drapeau}>
                    {drapeauDepuisIso(item.iso)}
                  </Text>

                  <Text style={styles.nom}>
                    {t(`auth:countries.${item.cle}`, item.cle)}
                  </Text>

                  <Text style={styles.indicatif}>{item.dial}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bouton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    drapeau: { fontSize: 18 },
    indicatif: { fontSize: 15, fontWeight: '700', color: c.text },
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
      paddingTop: 16,
      paddingBottom: 28,
      maxHeight: '70%',
    },
    titre: {
      fontSize: 15,
      fontWeight: '800',
      color: c.text,
      marginBottom: 8,
    },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    nom: { flex: 1, fontSize: 15, color: c.text },
  });
