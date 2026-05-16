import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function CounterRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
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

const styles = StyleSheet.create({
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
    color: '#111111',
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
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 18,
    color: '#111111',
  },
  counterInput: {
    width: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
});