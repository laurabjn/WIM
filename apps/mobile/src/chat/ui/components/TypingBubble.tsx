import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

function Point({ delai, couleur }: { delai: number; couleur: string }) {
  const opacite = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.delay(delai),
        Animated.timing(opacite, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacite, {
          toValue: 0.3,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(600 - delai),
      ]),
    );

    boucle.start();

    return () => boucle.stop();
  }, [delai, opacite]);

  return (
    <Animated.View
      style={[styles.point, { backgroundColor: couleur, opacity: opacite }]}
    />
  );
}

export function TypingBubble() {
  const themeColors = useThemeColors();
  const bulle = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={bulle.rangee}>
      <View style={bulle.bulle}>
        <Point delai={0} couleur={themeColors.onBubbleTheirs} />
        <Point delai={200} couleur={themeColors.onBubbleTheirs} />
        <Point delai={400} couleur={themeColors.onBubbleTheirs} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  point: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    rangee: {
      flexDirection: 'row',
      paddingHorizontal: 14,
      paddingBottom: 8,
    },
    bulle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 22,
      borderBottomLeftRadius: 6,
      backgroundColor: c.bubbleTheirs,
    },
  });
