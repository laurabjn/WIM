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
import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  addFavoriteHome,
  removeFavoriteHome,
} from 'src/home/infrastructure/home.api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HORIZONTAL_MARGIN = 20;
// Le conteneur de la liste porte le cadre de selection : 2px de bordure et 3px
// de padding de chaque cote. Sans les deduire, la carte depassait de 10px et le
// cadre bleu paraissait plus etroit qu'elle.
const SELECTION_FRAME_INSET = 10;
const IMAGE_WIDTH =
  SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN - SELECTION_FRAME_INSET;

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
  const [isFavorite, setIsFavorite] = useState(
    home.isFavorite ?? false,
  );

  async function handleToggleFavorite() {
    // Bascule immediate puis appel reseau : l'etoile ne doit pas attendre le
    // serveur pour reagir. En cas d'echec, on revient a l'etat precedent.
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);

    try {
      const session = await getSession();

      if (!session?.accessToken) {
        setIsFavorite(!nextValue);
        return;
      }

      if (nextValue) {
        await addFavoriteHome(session.accessToken, home.id);
      } else {
        await removeFavoriteHome(session.accessToken, home.id);
      }
    } catch (error) {
      setIsFavorite(!nextValue);
      console.log('Toggle favorite error:', error);
    }
  }

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
    <View style={styles.card}>
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
            <TouchableOpacity
              key={
                photo.id ??
                `${photo.url}-${index}`
              }
              activeOpacity={0.95}
              onPress={onPress}
            >
              <Image
                source={{ uri: photo.url }}
                style={styles.image}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.favorite}>
            {isFavorite ? '★' : '☆'}
          </Text>
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

      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.95}
        onPress={onPress}
      >
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
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // L'espacement entre resultats est gere par le conteneur de la liste :
    // une marge ici s'ajoutait a l'interieur du cadre de selection, qui
    // se refermait alors sur du vide sous la carte.
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
    // Aligne sur le badge numerote, qui est pose a 9px du bord de la photo.
    top: 9,
    right: 9,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    // Pastille opaque plutot qu'une etoile blanche posee a meme la photo :
    // sur un cliche clair, elle etait illisible malgre son ombre portee.
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  favorite: {
    // Etoile sombre sur la pastille claire : l'ombre portee ne sert plus a la
    // detacher du fond, c'est la pastille qui s'en charge.
    fontSize: 22,
    lineHeight: 24,
    color: '#087EBE',
    fontWeight: '400',
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