import { Home } from '@wim/shared/home/home.type';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  home: Home;
  onPressContact: () => void;
  exchangeStatus?: 'PENDING' | 'FUTURE' | 'CURRENT' | null;
};

function formatPeriode(startDate: string, endDate: string): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

  const debut = new Date(startDate).toLocaleDateString(undefined, options);
  const fin = new Date(endDate).toLocaleDateString(undefined, {
    ...options,
    year: 'numeric',
  });

  return `${debut} — ${fin}`;
}

export function HomeAvailabilityBadge({
  home,
  onPressContact,
  exchangeStatus,
}: Props) {
  const { t } = useTranslation("common");
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const periodes = (home.availabilities ?? [])
    .filter((availability) => availability.type === 'AVAILABLE')
    .filter((availability) => Date.parse(availability.endDate) >= Date.now())
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));

  return (
    <View style={styles.availabilityCard}>
      <View style={styles.entete}>
        <Text style={styles.titre}>{t('availabilityPeriodsTitle')}</Text>

        {exchangeStatus ? (
          <View style={styles.exchangeTag}>
            <Text style={styles.exchangeTagText}>
              {t(`exchangeState.${exchangeStatus}`)}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={onPressContact}
          >
            <Text style={styles.contactText}>{t('contact')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {periodes.length === 0 ? (
        <Text style={styles.vide}>{t('noAvailability')}</Text>
      ) : (
        periodes.map((availability) => (
          <View key={availability.id} style={styles.ligne}>
            <View style={styles.pastille} />

            <Text style={styles.ligneTexte}>
              {formatPeriode(availability.startDate, availability.endDate)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  exchangeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#D8F5DF',
  },

  exchangeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#267A40',
  },

  availabilityCard: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: c.surfaceAlt,
  },

  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },

  titre: {
    fontSize: 13,
    fontWeight: '800',
    color: c.text,
    flexShrink: 1,
  },

  vide: {
    fontSize: 13,
    color: c.textMuted,
  },

  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },

  pastille: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.accent,
  },

  ligneTexte: {
    flex: 1,
    fontSize: 13,
    color: c.text,
  },

  contactButton: {
    width: 118,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#24AEE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 28,
  },

  contactText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});