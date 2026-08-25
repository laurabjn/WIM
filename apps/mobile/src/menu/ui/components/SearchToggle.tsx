import React, { useEffect, useRef, useMemo } from 'react';
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

const CIRCLE_SIZE = 22;
const TOGGLE_WIDTH = 145;
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
      TOGGLE_WIDTH - CIRCLE_SIZE - TOGGLE_PADDING * 2,
    ],
  });

  return (
    <View style={styles.header}>
      <Text
        numberOfLines={1}
        style={[styles.headerText, !quickSearch && styles.headerTextActive]}
      >
        {exploreLabel}
      </Text>

      <TouchableOpacity activeOpacity={0.9} onPress={onToggle}>
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
  toggle: {
    width: TOGGLE_WIDTH,
    height: 28,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: TOGGLE_PADDING,
  },
  toggleCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: c.surface,
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