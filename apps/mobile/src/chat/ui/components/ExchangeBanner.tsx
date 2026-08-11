import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PendingExchange } from '@wim/shared';

type Props = {
  exchange: PendingExchange;
  onRespond: (response: 'ACCEPT' | 'DECLINE') => Promise<void>;
};

function formatRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
  };

  return `${start.toLocaleDateString(undefined, options)} — ${end.toLocaleDateString(undefined, options)}`;
}

export function ExchangeBanner({ exchange, onRespond }: Props) {
  const { t } = useTranslation('chat');
  const [pending, setPending] = useState(false);

  async function respond(response: 'ACCEPT' | 'DECLINE') {
    setPending(true);

    try {
      await onRespond(response);
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text style={styles.title}>{t('exchangePending')}</Text>

        <Text style={styles.dates}>
          {formatRange(exchange.startDate, exchange.endDate)}
        </Text>

        <Text style={styles.home} numberOfLines={1}>
          {exchange.homeTitle}
        </Text>
      </View>

      {pending ? (
        <ActivityIndicator color="#087EBE" />
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => respond('DECLINE')}
            activeOpacity={0.8}
          >
            <Text style={styles.declineText}>{t('exchangeDecline')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => respond('ACCEPT')}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptText}>{t('exchangeAccept')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F4F4F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  texts: {
    flex: 1,
  },

  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  dates: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  home: {
    marginTop: 2,
    fontSize: 11,
    color: '#9CA3AF',
  },

  actions: {
    alignItems: 'flex-end',
    gap: 6,
  },

  acceptButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#087EBE',
  },

  acceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  declineButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  declineText: {
    color: '#6B7280',
    fontSize: 12,
  },
});
