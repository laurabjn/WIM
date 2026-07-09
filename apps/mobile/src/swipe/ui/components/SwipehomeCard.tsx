import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  home: any;
  onLike: () => void;
  onDislike: () => void;
};

export function SwipeHomeCard({ home, onLike, onDislike }: Props) {
  const { t } = useTranslation(["profile", "swipe"])
  const [carouselVisible, setCarouselVisible] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;

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
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12,

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
        }).start();
      },
    }),
  ).current;
  
  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [{ translateX }, { rotate }],
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.95} onPress={() => setCarouselVisible(true)}>
          <Image source={{ uri: home.photos[0].url }} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Image source={{ uri: home.photos[1]?.url ?? home.photos[0].url }} style={styles.avatarImage} />
        </View>

        <Animated.View style={[styles.swipeBadge, styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={styles.likeText}>✓</Text>
        </Animated.View>

        <Animated.View style={[styles.swipeBadge, styles.dislikeBadge, { opacity: dislikeOpacity }]}>
          <Text style={styles.dislikeText}>×</Text>
        </Animated.View>

        <View style={styles.infoRow}>
          <View style={styles.left}>
            <Text style={styles.title}>{home.title} 🔵</Text>
            <Text style={styles.location}>{home.city}, {home.country}</Text>
            <Text style={styles.meta}>
              {home.bedrooms} {t('profile:bedrooms')} • {home.beds} {t('profile:beds')}
            </Text>
          </View>

          <View style={styles.rating}>
            <Star size={15} color="#111" fill="#111" />
            <Text style={styles.ratingText}>
              {home.averageRating} ({home.reviewsCount})
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.available}>{t('profile:available')}</Text>
          <Text style={styles.price}>✈ {t('profile:price')} {home.pricePerNight}€</Text>
        </View>

      <View style={styles.tags}>
        {home.amenities.map((tag: string, index: number) => (
          <LinearGradient
            key={tag}
            colors={['#FFF176', '#FFD84D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.tag,
              index === 5 && {
                marginLeft: 35,
              },
            ]}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </LinearGradient>
        ))}
      </View>
      </Animated.View>

      <Modal visible={carouselVisible} animationType="slide" transparent={false}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setCarouselVisible(false)}>
            <X size={26} color="#111" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {home.photos.map((photo: { url: string }, index: number) => (
              <Image
                key={`${photo.url}-${index}`}
                source={{ uri: photo.url }}
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 18,
    paddingBottom: 240,
  },
  image: {
    width: '100%',
    height: 370,
    borderRadius: 22,
  },
  avatar: {
    position: 'absolute',
    left: 34,
    top: 332,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#eee',
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
    color: '#111',
  },
  location: {
    marginTop: 3,
    fontSize: 14,
    color: '#555',
  },
  meta: {
    marginTop: 3,
    fontSize: 14,
    color: '#333',
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
    color: '#111',
  },
  statusRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  available: {
    backgroundColor: '#41D086',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '900',
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111',
  },
  tags: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 5,
    paddingHorizontal: 20,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  modal: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    zIndex: 10,
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: '100%',
    resizeMode: 'contain',
  },
  swipeBadge: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeText: {
    fontSize: 72,
    color: '#2ECC71',
    fontWeight: '900',
  },
  dislikeText: {
    fontSize: 82,
    color: '#E74C3C',
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