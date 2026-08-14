import { HomeOwner } from '@wim/shared/home/home.type';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  owner: HomeOwner;
  onPress?: () => void;
};

export function HostSummary({
  owner,
  onPress
}: Props) {
   const { t } = useTranslation('home');
   const themeColors = useThemeColors();
   const styles = useMemo(() => createStyles(themeColors), [themeColors]);
    
    function getYearsSince(date: string) {
      const createdAt = new Date(date);
      const now = new Date();
      return Math.max(0, now.getFullYear() - createdAt.getFullYear());
    }
    
   return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
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
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
    color: c.text,
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
    color: c.text,
    lineHeight: 18,
  },

  rating: {
    marginTop: 2,
    fontSize: 24,
    color: c.text,
    fontWeight: '400',
  },
});