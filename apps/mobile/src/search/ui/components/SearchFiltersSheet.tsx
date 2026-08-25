import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

export type HomeCategory = 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';

export type FiltresRecherche = {
  homeType?: string;
  category?: HomeCategory;
  capacity?: number;
  bedrooms?: number;
  amenities: string[];
};

export const FILTRES_VIDES: FiltresRecherche = { amenities: [] };

const TYPES = ['HOUSE', 'APARTMENT', 'STUDIO', 'VILLA'];
const CATEGORIES: HomeCategory[] = ['NATURE', 'BEACH', 'CITY', 'CULTURE'];
const EQUIPEMENTS = [
  'wifi',
  'kitchen',
  'parking',
  'tv',
  'washingMachine',
  'workspace',
  'airConditioning',
  'pool',
];
const MAXIMUM = 8;

export function compterFiltres(filtres: FiltresRecherche): number {
  return (
    (filtres.homeType ? 1 : 0) +
    (filtres.category ? 1 : 0) +
    (filtres.capacity ? 1 : 0) +
    (filtres.bedrooms ? 1 : 0) +
    filtres.amenities.length
  );
}

type Props = {
  visible: boolean;
  valeurs: FiltresRecherche;
  onFermer: () => void;
  onAppliquer: (filtres: FiltresRecherche) => void;
};

export const SearchFiltersSheet: React.FC<Props> = ({
  visible,
  valeurs,
  onFermer,
  onAppliquer,
}) => {
  const { t } = useTranslation(['search']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [brouillon, setBrouillon] = useState<FiltresRecherche>(valeurs);

  useEffect(() => {
    if (visible) setBrouillon(valeurs);
  }, [visible, valeurs]);

  function basculerChoix(champ: 'homeType' | 'category', valeur: string) {
    setBrouillon((actuel) => ({
      ...actuel,
      [champ]: actuel[champ] === valeur ? undefined : valeur,
    }));
  }

  function basculerEquipement(equipement: string) {
    setBrouillon((actuel) => ({
      ...actuel,
      amenities: actuel.amenities.includes(equipement)
        ? actuel.amenities.filter((element) => element !== equipement)
        : [...actuel.amenities, equipement],
    }));
  }

  function ajuster(champ: 'capacity' | 'bedrooms', pas: number) {
    setBrouillon((actuel) => {
      const suivant = (actuel[champ] ?? 0) + pas;

      return {
        ...actuel,
        [champ]: suivant < 1 || suivant > MAXIMUM ? undefined : suivant,
      };
    });
  }

  function libelleCompteur(valeur?: number) {
    return valeur ? valeur + '+' : t('search:filters.any');
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onFermer}
    >
      <Pressable style={styles.fond} onPress={onFermer} />

      <View style={styles.feuille}>
        <View style={styles.poignee} />

        <Text style={styles.titre}>{t('search:filters.title')}</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.section}>{t('search:filters.homeType')}</Text>
          <View style={styles.pastilles}>
            {TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => basculerChoix('homeType', type)}
                style={[
                  styles.pastille,
                  brouillon.homeType === type && styles.pastilleActive,
                ]}
              >
                <Text
                  style={[
                    styles.pastilleTexte,
                    brouillon.homeType === type && styles.pastilleTexteActif,
                  ]}
                >
                  {t('search:filters.types.' + type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>{t('search:filters.category')}</Text>
          <View style={styles.pastilles}>
            {CATEGORIES.map((categorie) => (
              <TouchableOpacity
                key={categorie}
                onPress={() => basculerChoix('category', categorie)}
                style={[
                  styles.pastille,
                  brouillon.category === categorie && styles.pastilleActive,
                ]}
              >
                <Text
                  style={[
                    styles.pastilleTexte,
                    brouillon.category === categorie &&
                      styles.pastilleTexteActif,
                  ]}
                >
                  {t('search:filters.categories.' + categorie)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(['capacity', 'bedrooms'] as const).map((champ) => (
            <View key={champ} style={styles.compteurLigne}>
              <Text style={styles.section}>
                {t(
                  champ === 'capacity'
                    ? 'search:filters.travellers'
                    : 'search:filters.bedrooms',
                )}
              </Text>

              <View style={styles.compteur}>
                <TouchableOpacity
                  style={styles.rond}
                  onPress={() => ajuster(champ, -1)}
                >
                  <Text style={styles.rondTexte}>-</Text>
                </TouchableOpacity>

                <Text style={styles.compteurValeur}>
                  {libelleCompteur(brouillon[champ])}
                </Text>

                <TouchableOpacity
                  style={styles.rond}
                  onPress={() => ajuster(champ, 1)}
                >
                  <Text style={styles.rondTexte}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <Text style={styles.section}>{t('search:filters.amenities')}</Text>
          <View style={styles.pastilles}>
            {EQUIPEMENTS.map((equipement) => (
              <TouchableOpacity
                key={equipement}
                onPress={() => basculerEquipement(equipement)}
                style={[
                  styles.pastille,
                  brouillon.amenities.includes(equipement) &&
                    styles.pastilleActive,
                ]}
              >
                <Text
                  style={[
                    styles.pastilleTexte,
                    brouillon.amenities.includes(equipement) &&
                      styles.pastilleTexteActif,
                  ]}
                >
                  {t('search:filters.equipments.' + equipement)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.pied}>
          <TouchableOpacity onPress={() => setBrouillon(FILTRES_VIDES)}>
            <Text style={styles.effacer}>{t('search:filters.reset')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.valider}
            onPress={() => onAppliquer(brouillon)}
          >
            <Text style={styles.validerTexte}>{t('search:filters.apply')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fond: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
    feuille: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingBottom: 20,
      maxHeight: '82%',
    },
    poignee: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      marginTop: 10,
      marginBottom: 12,
    },
    titre: {
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
    },
    section: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
      marginTop: 18,
      marginBottom: 10,
    },
    pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pastille: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceAlt,
    },
    pastilleActive: { backgroundColor: c.contrast, borderColor: c.contrast },
    pastilleTexte: { fontSize: 13, color: c.text },
    pastilleTexteActif: { color: c.onContrast, fontWeight: '600' },
    compteurLigne: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    compteur: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    rond: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rondTexte: { fontSize: 18, color: c.text },
    compteurValeur: {
      minWidth: 74,
      textAlign: 'center',
      fontSize: 14,
      color: c.textMuted,
    },
    pied: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 16,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    effacer: {
      fontSize: 14,
      color: c.textMuted,
      textDecorationLine: 'underline',
    },
    valider: {
      backgroundColor: c.contrast,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 999,
    },
    validerTexte: { color: c.onContrast, fontSize: 15, fontWeight: '600' },
  });
