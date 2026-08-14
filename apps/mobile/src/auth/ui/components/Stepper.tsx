import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  current: number;
  total: number;
};

export const Stepper: React.FC<Props> = ({ current, total }) => {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step) => {
        const isActive = step === current;
        const isDone = step < current;

        return (
          <View
            key={step}
            style={[
              styles.circle,
              (isActive || isDone) && styles.circleActive,
            ]}
          >
            <Text
              style={[
                styles.text,
                (isActive || isDone) && styles.textActive,
              ]}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleActive: {
    backgroundColor: '#3CC7D6',
  },

  text: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C7C7C',
  },

  textActive: {
    color: c.onContrast,
  },
});