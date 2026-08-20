import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Exchange } from '@wim/shared';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

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
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

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
        {exchange.partner ? (
          <Text style={styles.partner} numberOfLines={1}>
            {exchange.isHost ? t('guest') : t('host')} ·{' '}
            {exchange.partner.firstName} {exchange.partner.lastName}
          </Text>
        ) : null}

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

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressMessages}
          disabled={!exchange.chatId}
        >
          <Text
            style={[styles.icon, !exchange.chatId && styles.iconDisabled]}
          >
            ▤
          </Text>
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

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: c.surface,
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
    backgroundColor: c.surfaceAlt,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  partner: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: c.text,
  },
  iconDisabled: {
    opacity: 0.3,
  },
  dates: {
    fontSize: 12,
    color: c.text,
    marginBottom: 8,
  },
  travelers: {
    fontSize: 12,
    color: c.text,
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
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 15,
    color: c.text,
  },
});