import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  title: string;
  filtersCount?: number;
  onBack: () => void;
  onOpenFilters: () => void;
};

export function SearchResultsHeader({
  title,
  filtersCount = 0,
  onBack,
  onOpenFilters,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <View style={styles.header}>
      <BackButton onPress={onBack} style={styles.iconButton} />

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onOpenFilters}
      >
        <SlidersHorizontal size={18} color={themeColors.text} />

        {filtersCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filtersCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: c.contrast,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: c.onContrast,
    fontSize: 10,
    fontWeight: '700',
  },
  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.surface,
    zIndex: 20,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  title: {
    fontSize: 13,
    fontWeight: '800',
    color: c.text,
  },
});