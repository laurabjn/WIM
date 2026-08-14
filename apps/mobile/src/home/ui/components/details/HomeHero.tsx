import { Home } from '@wim/shared/home/home.type';
import React, { useState } from 'react';
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

      <BackButton onPress={onBack} style={[styles.circleButton, styles.backButton]} />

      <View style={styles.topActions}>
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

const styles = StyleSheet.create({
  hero: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  emptyHero: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeroText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
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
    color: '#111111',
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