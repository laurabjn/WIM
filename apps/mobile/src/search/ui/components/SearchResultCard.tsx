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
import { Star } from 'lucide-react-native';
import { Home } from '@wim/shared/home/home.type';
import { useTranslation } from 'react-i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HORIZONTAL_MARGIN = 20;
const IMAGE_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN;

type Props = {
  home: Home;
  onPress: () => void;
};

export function SearchResultCard({
  home,
  onPress,
}: Props) {
  const { t } = useTranslation('profile');
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos =
    home.photos && home.photos.length > 0
      ? home.photos
      : [
          {
            id: 'fallback-photo',
            url:
              'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
            position: 0,
          },
        ];

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        IMAGE_WIDTH,
    );

    setPhotoIndex(nextIndex);
  }

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={onPress}
    >
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
        >
          {photos.map((photo, index) => (
            <Image
              key={
                photo.id ??
                `${photo.url}-${index}`
              }
              source={{ uri: photo.url }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={(event) => {
            event.stopPropagation();
            console.log(
              'Favorite pressed:',
              home.id,
            );
          }}
        >
          <Text style={styles.favorite}>☆</Text>
        </TouchableOpacity>

        {photos.length > 1 ? (
          <View style={styles.pagination}>
            {photos.map((_, index) => (
              <View
                key={`photo-dot-${index}`}
                style={[
                  styles.paginationDot,
                  index === photoIndex &&
                    styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>
            {photoIndex + 1}/{photos.length}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.left}>
            <Text style={styles.title}>
              {home.title}
            </Text>

            <Text style={styles.location}>
              {home.city}, {home.country}
            </Text>

            <Text style={styles.meta}>
              {home.bedrooms ?? 1}{' '}
              {t('bedrooms')} •{' '}
              {home.beds ?? 1} {t('beds')}
            </Text>
          </View>

          <View style={styles.rating}>
            <Star
              size={13}
              color="#111"
              fill="#111"
            />

            <Text style={styles.ratingText}>
              {home.averageRating ?? 4.6} (
              {home.reviewsCount ?? 0})
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.available}>
            {t('available')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    backgroundColor: '#fff',
  },

  carouselContainer: {
    width: IMAGE_WIDTH,
    height: 360,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F1F1',
  },

  image: {
    width: IMAGE_WIDTH,
    height: 360,
    resizeMode: 'cover',
  },

  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  favorite: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '300',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  pagination: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor:
      'rgba(255,255,255,0.55)',
  },

  paginationDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  photoCounter: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    minWidth: 40,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor:
      'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoCounterText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  content: {
    marginTop: 8,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  left: {
    flex: 1,
  },

  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
  },

  location: {
    marginTop: 2,
    fontSize: 11,
    color: '#555',
  },

  meta: {
    marginTop: 2,
    fontSize: 11,
    color: '#444',
  },

  rating: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },

  bottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  available: {
    backgroundColor: '#41D086',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '800',
  },
});