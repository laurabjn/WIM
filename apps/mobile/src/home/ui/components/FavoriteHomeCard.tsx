import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Home } from '@wim/shared/home/home.type';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  home: Home;
  onPress: (homeId: string) => void;
  onPressFavorite?: (homeId: string) => void;
};

export function FavoriteHomeCard({
  home,
  onPress,
  onPressFavorite,
}: Props) {
  const { t } = useTranslation(['home', 'profile']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress(home.id)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              home.photos?.[0]?.url ??
              'https://via.placeholder.com/500x300.png?text=Home',
          }}
          style={styles.image}
        />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onPressFavorite?.(home.id)}
        >
          <Text style={styles.favoriteIcon}>★</Text>
        </TouchableOpacity>

        {home.owner.avatarUrl ? (
          <Image
            source={{ uri: home.owner.avatarUrl }}
            style={styles.ownerAvatar}
          />
        ) : null}

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {home.title}
          </Text>

          <Text style={styles.rating}>
            ★ {home.averageRating?.toFixed(1) ?? '0.0'} ({home.reviewsCount ?? 0})
          </Text>
        </View>

        <Text style={styles.location}>
          {home.city}, {home.country}
        </Text>

        <Text style={styles.details}>
          {home.bedrooms ?? 0} {t('bedrooms')} • {home.beds ?? 0} {t('beds')}
        </Text>

        <View style={styles.bottomRow}>
          {home.isAvailableForExchange ? (
            <View style={styles.badgeAvailable}>
              <Text style={styles.badgeAvailableText}>{t('available')}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#DDD',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    color: c.text,
    fontSize: 16,
  },
  ownerAvatar: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#DDD',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: c.surface,
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
    flex: 1,
  },
  rating: {
    fontSize: 12,
    color: '#444',
  },
  location: {
    marginTop: 4,
    fontSize: 12,
    color: c.textMuted,
  },
  details: {
    marginTop: 6,
    fontSize: 12,
    color: '#444',
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeAvailable: {
    backgroundColor: '#D8F5DF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeAvailableText: {
    fontSize: 11,
    color: '#267A40',
    fontWeight: '600',
  },
  badgeSeason: {
    backgroundColor: '#FFF2D8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeSeasonText: {
    fontSize: 11,
    color: c.warning,
    fontWeight: '600',
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
  },
});