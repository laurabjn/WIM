import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  getLabel: (value: string) => string;
};

export function StayDurationSlider({
  value,
  onChange,
  options,
  getLabel,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const selectedIndex = Math.max(0, options.indexOf(value));

  return (
    <View style={styles.sliderCard}>
      <View style={styles.sliderTopRow}>
        <Text style={styles.minLabel}>{getLabel(options[0])}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getLabel(value)}</Text>
        </View>

        <Text style={styles.maxLabel}>
          {getLabel(options[options.length - 1])}
        </Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={options.length - 1}
        step={1}
        value={selectedIndex}
        onValueChange={(index) => {
          const selected = options[index];
          if (selected) onChange(selected);
        }}
        minimumTrackTintColor="#48CDB1"
        maximumTrackTintColor="#D9D9D9"
        thumbTintColor="#48CDB1"
      />

      <View style={styles.ticksRow}>
        {options.map((option, index) => (
          <View key={option} style={styles.tickItem}>
            <View
              style={[
                styles.tick,
                index <= selectedIndex && styles.tickActive,
              ]}
            />
            <Text
              style={[
                styles.tickLabel,
                index === selectedIndex && styles.tickLabelActive,
              ]}
            >
              {getLabel(option)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  sliderCard: {
    backgroundColor: c.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },

  sliderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  minLabel: {
    fontSize: 11,
    color: '#9B9B9B',
  },

  maxLabel: {
    fontSize: 11,
    color: '#9B9B9B',
  },

  badge: {
    backgroundColor: '#48CDB1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: c.onContrast,
    fontSize: 12,
    fontWeight: '700',
  },

  slider: {
    width: '100%',
    height: 40,
  },

  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  tickItem: {
    alignItems: 'center',
    flex: 1,
  },

  tick: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginBottom: 6,
  },

  tickActive: {
    backgroundColor: '#48CDB1',
  },

  tickLabel: {
    fontSize: 9,
    color: '#9B9B9B',
    textAlign: 'center',
  },

  tickLabelActive: {
    color: c.text,
    fontWeight: '700',
  },
});