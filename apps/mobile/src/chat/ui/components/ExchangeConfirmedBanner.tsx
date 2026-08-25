import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PendingExchange } from '@wim/shared';

import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  exchange: PendingExchange;
};

function formatDay(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export const ExchangeConfirmedBanner: React.FC<Props> = ({ exchange }) => {
  const { t } = useTranslation('chat');
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const chezMoi = exchange.isHost
    ? exchange.guestHomeTitle ?? t('bannerNoHome')
    : exchange.homeTitle;

  return (
    <View style={styles.bandeau}>
      <Text style={styles.titre}>{t('exchangeConfirmed')}</Text>

      <Text style={styles.ligne}>
        {t('bannerYouGo')} {chezMoi}
      </Text>

      <Text style={styles.dates}>
        {t('exchangeFrom')} {formatDay(exchange.startDate)}{' '}
        {t('exchangeTo')} {formatDay(exchange.endDate)}
      </Text>
    </View>
  );
};

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bandeau: {
      marginHorizontal: 12,
      marginTop: 8,
      padding: 14,
      borderRadius: 16,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      gap: 4,
    },
    titre: { fontSize: 15, fontWeight: '700', color: c.success },
    ligne: { fontSize: 14, color: c.text },
    dates: { fontSize: 13, color: c.textMuted },
  });
