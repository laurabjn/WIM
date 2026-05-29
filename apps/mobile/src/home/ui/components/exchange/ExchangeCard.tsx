import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Exchange } from '@wim/shared';
import { useTranslation } from 'react-i18next';

type Props = {
  exchange: Exchange;
  onPressDetails: () => void;
  onPressMessages: () => void;
};

export function ExchangeCard({
  exchange,
  onPressDetails,
  onPressMessages,
}: Props) {
  const { t } = useTranslation("home");

  return (
    <View style={styles.card}>
      <Image
        source={
          exchange.homeImageUrl
            ? { uri: exchange.homeImageUrl }
            : require('../../../../../assets/logo.jpg')
        }
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {exchange.homeTitle}
        </Text>

        <Text style={styles.dates}>
          {formatDate(exchange.startDate)} - {formatDate(exchange.endDate)}
        </Text>

        <Text style={styles.travelers}>
          {exchange.travelersCount} {t('traveler')}
          {exchange.travelersCount > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={onPressDetails}>
          <Text style={styles.icon}>ⓘ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onPressMessages}>
          <Text style={styles.icon}>▤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: {
    width: 96,
    height: 86,
    borderRadius: 14,
    backgroundColor: '#EDEDED',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  dates: {
    fontSize: 12,
    color: '#222222',
    marginBottom: 8,
  },
  travelers: {
    fontSize: 12,
    color: '#444444',
  },
  actions: {
    justifyContent: 'center',
    gap: 10,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 15,
    color: '#111111',
  },
});