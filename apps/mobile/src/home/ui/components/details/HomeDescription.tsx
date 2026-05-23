import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  description?: string | null;
};

export function HomeDescription({ description }: Props) {
  const { t } = useTranslation('home');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('description')}</Text>

      <Text style={styles.description}>
        {description || t('noDescription')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 18,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333333',
  },
});