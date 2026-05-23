import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Exchange } from '@wim/shared';
import { ExchangeCard } from './ExchangeCard';

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

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
});