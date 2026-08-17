import React, { useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HORIZONTAL_PADDING = 18;
const CAROUSEL_WIDTH =
  SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;

type Props = {
  home: any;
  onPress: () => void;
  onLike: () => void;
  onDislike: () => void;
};

export function SwipeHomeCard({
  home,
  onLike,
  onDislike,
}: Props) {
  const { t } = useTranslation(['profile', 'swipe']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isCarouselDragging, setIsCarouselDragging] =
    useState(false);

  const translateX = useRef(
    new Animated.Value(0),
  ).current;

  const rotate = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const likeOpacity = translateX.interpolate({
    inputRange: [40, 140],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = translateX.interpolate({
    inputRange: [-140, -40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (isCarouselDragging) {
          return false;
        }

        return (
          Math.abs(gesture.dx) > 12 &&
          Math.abs(gesture.dx) >
            Math.abs(gesture.dy)
        );
      },

      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onLike();
          });

          return;
        }

        if (gesture.dx < -120) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onDislike();
          });

          return;
        }

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }).start();
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  function handleCarouselScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        CAROUSEL_WIDTH,
    );

    setPhotoIndex(nextIndex);
    setIsCarouselDragging(false);
  }

  const photos =
    home.photos?.length > 0
      ? home.photos
      : [
          {
            id: 'fallback',
            url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
          },
        ];

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          transform: [
            { translateX },
            { rotate },
          ],
        },
      ]}
    >
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onTouchStart={() =>
            setIsCarouselDragging(true)
          }
          onMomentumScrollEnd={
            handleCarouselScrollEnd
          }
          onScrollEndDrag={() => {
            setTimeout(() => {
              setIsCarouselDragging(false);
            }, 80);
          }}
        >
          {photos.map(
            (
              photo: {
                id?: string;
                url: string;
              },
              index: number,
            ) => (
              <Image
                key={
                  photo.id ??
                  `${photo.url}-${index}`
                }
                source={{ uri: photo.url }}
                style={styles.carouselImage}
              />
            ),
          )}
        </ScrollView>

        {photos.length > 1 && (
          <View style={styles.pagination}>
            {photos.map(
              (
                _: unknown,
                index: number,
              ) => (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.paginationDot,
                    index === photoIndex &&
                      styles.paginationDotActive,
                  ]}
                />
              ),
            )}
          </View>
        )}

        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>
            {photoIndex + 1}/{photos.length}
          </Text>
        </View>
      </View>

      <View style={styles.avatar}>
        <Image
          source={{
            uri:
              home.owner?.avatarUrl ??
              photos[1]?.url ??
              photos[0].url,
          }}
          style={styles.avatarImage}
        />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.swipeBadge,
          styles.likeBadge,
          {
            opacity: likeOpacity,
          },
        ]}
      >
        <Text style={styles.likeText}>✓</Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.swipeBadge,
          styles.dislikeBadge,
          {
            opacity: dislikeOpacity,
          },
        ]}
      >
        <Text style={styles.dislikeText}>
          ×
        </Text>
      </Animated.View>

      <View style={styles.infoRow}>
        <View style={styles.left}>
          <Text style={styles.title}>
            {home.title} 🔵
          </Text>

          <Text style={styles.location}>
            {home.city}, {home.country}
          </Text>

          <Text style={styles.meta}>
            {home.bedrooms}{' '}
            {t('profile:bedrooms')} •{' '}
            {home.beds} {t('profile:beds')}
          </Text>
        </View>

        <View style={styles.rating}>
          <Star
            size={15}
            color={themeColors.text}
            fill="#111"
          />

          <Text style={styles.ratingText}>
            {home.averageRating} (
            {home.reviewsCount})
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.available}>
          {t('profile:available')}
        </Text>
      </View>

      <View style={styles.tags}>
        {home.amenities.map(
          (tag: string) => (
            <LinearGradient
              key={tag}
              colors={['#FFF176', '#FFD84D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tag}
            >
              <Text style={styles.tagText}>
                {tag}
              </Text>
            </LinearGradient>
          ),
        )}
      </View>
    </Animated.View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  card: {
    paddingHorizontal:
      CARD_HORIZONTAL_PADDING,
    paddingBottom: 240,
  },
  carouselContainer: {
    width: CAROUSEL_WIDTH,
    height: 370,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
  },
  carouselImage: {
    width: CAROUSEL_WIDTH,
    height: 370,
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: c.surface,
  },
  photoCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    minWidth: 42,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 9,
    backgroundColor:
      'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  avatar: {
    position: 'absolute',
    left: 34,
    top: 332,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  infoRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: c.text,
  },
  location: {
    marginTop: 3,
    fontSize: 14,
    color: c.textMuted,
  },
  meta: {
    marginTop: 3,
    fontSize: 14,
    color: c.text,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '800',
    color: c.text,
  },
  statusRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  available: {
    backgroundColor: '#41D086',
    color: c.onContrast,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '900',
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: c.text,
  },
  tags: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 5,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3D2A00',
    textAlign: 'center',
  },
  swipeBadge: {
    position: 'absolute',
    top: 135,
    left: '50%',
    marginLeft: -55,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor:
      'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  likeText: {
    fontSize: 72,
    color: c.success,
    fontWeight: '900',
  },
  dislikeText: {
    fontSize: 82,
    color: c.danger,
    fontWeight: '900',
  },
  likeBadge: {
    borderWidth: 4,
    borderColor: '#2ECC71',
  },
  dislikeBadge: {
    borderWidth: 4,
    borderColor: '#E74C3C',
  },
});