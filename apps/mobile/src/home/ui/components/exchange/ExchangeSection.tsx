import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Exchange } from '@wim/shared';
import { ExchangeCard } from './ExchangeCard';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  title: string;
  exchanges: Exchange[];
  onPressDetails: (exchange: Exchange) => void;
  onPressMessages: (exchange: Exchange) => void;
};

export function ExchangeSection({
  title,
  exchanges,
  onPressDetails,
  onPressMessages,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  if (exchanges.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {exchanges.map((exchange) => (
        <ExchangeCard
          key={exchange.id}
          exchange={exchange}
          onPressDetails={() => onPressDetails(exchange)}
          onPressMessages={() => onPressMessages(exchange)}
        />
      ))}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: c.text,
    marginBottom: 8,
  },
});