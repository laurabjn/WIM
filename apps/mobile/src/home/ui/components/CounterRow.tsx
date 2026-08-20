import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

export function CounterRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <View style={styles.counterRow}>
      <Text style={styles.counterLabel}>{label}</Text>

      <View style={styles.counterControls}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => onChange(Math.max(1, value - 1))}
        >
          <Text style={styles.counterButtonText}>−</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.counterInput}
          value={String(value)}
          keyboardType="numeric"
          onChangeText={(text) => {
            const next = Number(text.replace(/[^0-9]/g, ''));
            onChange(Number.isNaN(next) || next <= 0 ? 1 : next);
          }}
        />

        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => onChange(value + 1)}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  counterRow: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 18,
    color: c.text,
  },
  counterInput: {
    width: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
});