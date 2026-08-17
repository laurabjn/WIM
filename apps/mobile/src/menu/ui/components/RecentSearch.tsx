import { useMemo } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

export function RecentSearch({
  image,
  title,
  dates,
  travelers,
  onPress,
}: {
  image: string;
  title: string;
  dates: string;
  travelers: string;
  onPress?: () => void;
}) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <TouchableOpacity
      style={styles.recentCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: image }} style={styles.recentImage} />

      <View style={styles.recentContent}>
        <Text style={styles.recentTitle}>{title}</Text>
        <Text style={styles.recentText}>{dates}</Text>
        <Text style={styles.recentText}>{travelers}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  recentCard: {
    height: 95,
    borderRadius: 16,
    backgroundColor: c.surface,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  recentImage: {
    width: 105,
    height: '100%',
  },
  recentContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  recentText: {
    fontSize: 12,
    color: c.text,
    marginBottom: 4,
  },
});