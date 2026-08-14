import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exchange, HomeAvailability } from '@wim/shared';

type Props = {
  availabilities: HomeAvailability[];
  exchanges: Exchange[];
};

function formatPeriod(startDate: string, endDate: string): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
  };

  const debut = new Date(startDate).toLocaleDateString(undefined, options);
  const fin = new Date(endDate).toLocaleDateString(undefined, {
    ...options,
    year: 'numeric',
  });

  return `${debut} — ${fin}`;
}

// Sur son propre logement, l'utilisateur n'a rien a mettre en favori ni
// personne a contacter : ce qui l'interesse, c'est ce qu'il a ouvert et ce qui
// est deja engage.
export function OwnerHomeStatus({ availabilities, exchanges }: Props) {
  const { t } = useTranslation('home');

  const ouvertes = availabilities.filter(
    (availability) => availability.type === 'AVAILABLE',
  );

  const bloquees = availabilities.filter(
    (availability) => availability.type === 'BLOCKED',
  );

  const engages = exchanges.filter(
    (exchange) =>
      exchange.status === 'CURRENT' ||
      exchange.status === 'FUTURE' ||
      exchange.status === 'PENDING',
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('ownerAvailability')}</Text>

      {ouvertes.length === 0 ? (
        <Text style={styles.empty}>{t('ownerNoAvailability')}</Text>
      ) : (
        ouvertes.map((availability) => (
          <View key={availability.id} style={styles.row}>
            <View style={[styles.dot, styles.dotOpen]} />
            <Text style={styles.rowText}>
              {formatPeriod(availability.startDate, availability.endDate)}
            </Text>
          </View>
        ))
      )}

      {bloquees.map((availability) => (
        <View key={availability.id} style={styles.row}>
          <View style={[styles.dot, styles.dotBlocked]} />
          <Text style={styles.rowText}>
            {formatPeriod(availability.startDate, availability.endDate)} ·{' '}
            {t('ownerBlocked')}
          </Text>
        </View>
      ))}

      {engages.length > 0 ? (
        <>
          <Text style={[styles.title, styles.titleSpaced]}>
            {t('ownerExchanges')}
          </Text>

          {engages.map((exchange) => (
            <View key={exchange.id} style={styles.row}>
              <View style={[styles.dot, styles.dotExchange]} />
              <Text style={styles.rowText}>
                {formatPeriod(exchange.startDate, exchange.endDate)} ·{' '}
                {t(`ownerStatus.${exchange.status}`, exchange.status)}
                {exchange.partner
                  ? ` · ${exchange.partner.firstName ?? ''}`
                  : ''}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F7F7F8',
  },

  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
  },

  titleSpaced: {
    marginTop: 16,
  },

  empty: {
    fontSize: 13,
    color: '#6B7280',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dotOpen: {
    backgroundColor: '#52D1A6',
  },

  dotBlocked: {
    backgroundColor: '#9CA3AF',
  },

  dotExchange: {
    backgroundColor: '#2DA7F3',
  },

  rowText: {
    flex: 1,
    fontSize: 13,
    color: '#111111',
  },
});
