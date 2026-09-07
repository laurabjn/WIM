import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  quickSearch: boolean;
  onToggle: () => void;
  exploreLabel: string;
  quickSearchLabel: string;
};

const BOUTON_LARGEUR = 34;
const BOUTON_HAUTEUR = 22;
const TOGGLE_LARGEUR_MINIMALE = 145;
const TOGGLE_PADDING = 4;

export function SearchToggle({
  quickSearch,
  onToggle,
  exploreLabel,
  quickSearchLabel,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const progress = useRef(new Animated.Value(quickSearch ? 1 : 0)).current;

  const [largeur, setLargeur] = useState(TOGGLE_LARGEUR_MINIMALE);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: quickSearch ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [quickSearch, progress]);

  const opaciteRapide = progress;

  const opaciteExplorer = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      Math.max(0, largeur - BOUTON_LARGEUR - TOGGLE_PADDING * 2),
    ],
  });

  function choisir(rapide: boolean) {
    if (rapide !== quickSearch) onToggle();
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => choisir(false)}
        activeOpacity={0.7}
        hitSlop={8}
        style={styles.libelle}
      >
        <Text
          numberOfLines={1}
          style={[styles.headerText, !quickSearch && styles.headerTextActive]}
        >
          {exploreLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggle}
        style={styles.pisteBouton}
        onLayout={(evenement) =>
          setLargeur(evenement.nativeEvent.layout.width)
        }
      >
        <View style={styles.toggle}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: opaciteExplorer }]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={['#40D890', '#ffffff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: opaciteRapide }]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={['#ffffff', '#4FC3FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.toggleCircle,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => choisir(true)}
        activeOpacity={0.7}
        hitSlop={8}
        style={styles.libelle}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.headerText,
            styles.headerTextEnd,
            quickSearch && styles.headerTextActive,
          ]}
        >
          {quickSearchLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: c.textMuted,
    flexShrink: 1,
  },
  headerTextEnd: {
    textAlign: 'right',
  },
  headerTextActive: {
    color: c.text,
    fontWeight: '800',
  },
  pisteBouton: {
    flex: 1,
    minWidth: TOGGLE_LARGEUR_MINIMALE,
  },
  libelle: {
    flexShrink: 1,
  },
  toggle: {
    height: 32,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: TOGGLE_PADDING,
  },
  toggleCircle: {
    width: BOUTON_LARGEUR,
    height: BOUTON_HAUTEUR,
    borderRadius: BOUTON_HAUTEUR / 2,
    backgroundColor: '#FFFFFF',
        shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 3,
  },
});