import { Home } from '@wim/shared/home/home.type';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  home: Home;
  onPressContact: () => void;
};

export function HomeAvailabilityBadge({ home, onPressContact }: Props) {
  const { t } = useTranslation("common");
  function getAvailabilityLabel(home: Home) {
    const availabilities = home.availabilities ?? [];

    if (availabilities.length === 0) {
        return t("noAvailability");
    }

    const hasFreeAvailability = availabilities.some(
        (availability) => availability.type === 'AVAILABLE',
    );

    const hasBlockedDates = availabilities.some(
        (availability) => availability.type === 'BLOCKED',
    );

    if (hasFreeAvailability && !hasBlockedDates) {
        return t("available");
    }

    if (hasFreeAvailability && hasBlockedDates) {
        return t("availableWithBlockDates");
    }

    return t("specificDates");
  }
    
  return (
    <View style={styles.availabilityCard}>
        <View style={styles.availabilityLeft}>
            <Text style={styles.availabilityIcon}>▦</Text>
            <Text style={styles.availabilityText}>
            {getAvailabilityLabel(home)}
            </Text>
        </View>

        <TouchableOpacity
            style={styles.contactButton}
            onPress={onPressContact}
        >
            <Text style={styles.contactText}>{t("contact")}</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  availabilityCard: {
    marginHorizontal: 12,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  availabilityIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#111111',
  },

  availabilityText: {
    fontSize: 13,
    color: '#111111',
    fontWeight: '500',
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