import { Home } from '@wim/shared/home/home.type';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  home: Home;
};

export function HomeLocation({ home }: Props) {
  const { t } = useTranslation('home');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('locationSectionTitle')}</Text>

      <View style={styles.locationBox}>
        <Text style={styles.locationTitle}>
          {home.city}, {home.country}
        </Text>

        {home.address ? (
          <Text style={styles.description}>{home.address}</Text>
        ) : (
          <Text style={styles.description}>{t('hiddenAddress')}</Text>
        )}

        {home.latitude && home.longitude ? (
          <Text style={styles.coordinates}>
            {t('coordinates')} : {home.latitude}, {home.longitude}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  locationBox: {
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  locationTitle: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333333',
  },
  coordinates: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
});