import { HomeOwner } from '@wim/shared/home/home.type';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  owner: HomeOwner;
};

export function HostSummary({
  owner
}: Props) {
   const { t } = useTranslation('home');
    
    function getYearsSince(date: string) {
      const createdAt = new Date(date);
      const now = new Date();
      return Math.max(0, now.getFullYear() - createdAt.getFullYear());
    }
    
   return (
    <View style={styles.container}>
      <Image
        source={
          owner.avatarUrl
            ? { uri: owner.avatarUrl }
            : require('../../../../../assets/logo.jpg')
        }
        style={styles.avatar}
      />

      <View style={styles.textWrapper}>
        <Text style={styles.hostName}>{t('host')} : {owner.firstName} {owner.lastName}</Text>
        <Text style={styles.hostSince}>{t('hostSince', { count: getYearsSince(owner.createdAt) })}</Text>
      </View>

      <View style={styles.ratingWrapper}>
        <Text style={styles.star}>★</Text>
        <Text style={styles.rating}>{owner?.rating?.toFixed(1) || 'N/A'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  textWrapper: {
    flex: 1,
  },

  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  hostSince: {
    marginTop: 3,
    fontSize: 13,
    color: '#6B6B6B',
  },

  ratingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  star: {
    fontSize: 18,
    color: '#111111',
    lineHeight: 18,
  },

  rating: {
    marginTop: 2,
    fontSize: 24,
    color: '#111111',
    fontWeight: '400',
  },
});