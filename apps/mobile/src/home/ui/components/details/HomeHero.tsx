import { Home } from '@wim/shared/home/home.type';
import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { resolveImageUrl } from 'src/home/infrastructure/home.api';
import { Share } from 'react-native';
import { BackButton } from 'src/shared/ui/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  home: Home;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (homeId: string) => void;
  showFavorite?: boolean;
  onShare?: () => void;
};

export function HomeHero({
  home,
  onBack,
  isFavorite,
  onToggleFavorite,
  onShare,
  showFavorite = true,
}: Props) {
  const { t } = useTranslation('home');
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = (home.photos ?? [])
    .map((photo) => resolveImageUrl(photo.url))
    .filter(Boolean) as string[];

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setPhotoIndex(
      Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH),
    );
  }

  return (
    <View style={styles.hero}>
      {photos.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
        >
          {photos.map((url, index) => (
            <Image
              key={`${url}-${index}`}
              source={{ uri: url }}
              style={styles.heroImage}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHero}>
          <Text style={styles.emptyHeroText}>{t('noPhotos')}</Text>
        </View>
      )}

      <BackButton
        onPress={onBack}
        style={[styles.circleButton, styles.backButton, { top: 16 + insets.top }]}
      />

      <View style={[styles.topActions, { top: 16 + insets.top }]}>
        <TouchableOpacity style={styles.circleButton} onPress={onShare}>
          <Text style={styles.icon}>↗</Text>
        </TouchableOpacity>

        {showFavorite ? (
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => onToggleFavorite(home.id)}
          >
            <Text style={[styles.icon, isFavorite && styles.favoriteIcon]}>
              {isFavorite ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {photos.length > 0 ? (
        <Text style={styles.imageCounter}>
          {photoIndex + 1}/{photos.length}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  hero: {
    aspectRatio: 1,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  emptyHero: {
    width: '100%',
    height: '100%',
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeroText: {
    color: c.textMuted,
    fontWeight: '600',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  topActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    fontSize: 20,
    color: c.text,
  },
  favoriteIcon: {
    color: '#F59E0B',
  },
  imageCounter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});