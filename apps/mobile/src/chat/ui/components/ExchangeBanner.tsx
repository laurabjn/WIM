import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react-native';
import type { PendingExchange } from '@wim/shared';

type Props = {
  exchange: PendingExchange;
  onAccept: () => Promise<void>;
  onChangeDates: (startDate: Date, endDate: Date) => Promise<void>;
};

function formatDay(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
  });
}

export function ExchangeBanner({
  exchange,
  onAccept,
  onChangeDates,
}: Props) {
  const { t } = useTranslation('chat');

  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState<'start' | 'end' | null>(null);
  const [startDate, setStartDate] = useState(new Date(exchange.startDate));

  async function accept() {
    setPending(true);

    try {
      await onAccept();
    } finally {
      setPending(false);
    }
  }

  async function handlePicked(picked?: Date) {
    const step = editing;

    setEditing(null);

    if (!picked || !step) return;

    if (step === 'start') {
      setStartDate(picked);

      setTimeout(() => setEditing('end'), 250);
      return;
    }

    if (picked <= startDate) return;

    setPending(true);

    try {
      await onChangeDates(startDate, picked);
    } catch (error) {
      console.log('Update exchange dates error:', error);
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('exchangePending')}</Text>

      <Text style={styles.home} numberOfLines={1}>
        {t('bannerYouGo')}{' '}
        {exchange.isHost
          ? exchange.guestHomeTitle ?? t('bannerNoHome')
          : exchange.homeTitle}
      </Text>

      <Text style={styles.home} numberOfLines={1}>
        {t('bannerTheyCome')}{' '}
        {exchange.isHost
          ? exchange.homeTitle
          : exchange.guestHomeTitle ?? t('bannerNoHome')}
      </Text>

      <Text style={styles.dates}>
        {t('exchangeFrom')} {formatDay(exchange.startDate)}{' '}
        {t('exchangeTo')} {formatDay(exchange.endDate)}
      </Text>

      {pending ? (
        <ActivityIndicator style={styles.loader} color="#111111" />
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={accept}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptText}>{t('exchangeAccept')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datesButton}
            onPress={() => setEditing('start')}
            activeOpacity={0.85}
          >
            <CalendarDays size={18} color="#111111" />
          </TouchableOpacity>
        </View>
      )}

      {editing ? (
        <DateTimePicker
          value={
            editing === 'start'
              ? startDate
              : new Date(startDate.getTime() + 86400000)
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={editing === 'end' ? startDate : new Date()}
          onChange={(event, picked) =>
            handlePicked(event.type === 'dismissed' ? undefined : picked)
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },

  home: {
    marginTop: 4,
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },

  dates: {
    marginTop: 4,
    fontSize: 12,
    color: '#087EBE',
    textAlign: 'center',
  },

  loader: {
    marginTop: 12,
  },

  actions: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },

  acceptButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  acceptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },

  datesButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
