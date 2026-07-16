import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Home } from '@wim/shared/home/home.type';
import { useTranslation } from 'react-i18next';

type Props = {
  home: Home;
  onPress: () => void;
};

export function SearchResultCard({ home, onPress }: Props) {
    const { t } = useTranslation('profile');
    
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Image
          source={{
            uri:
              home.photos?.[0]?.url ??
              'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
          }}
          style={styles.image}
        />

        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favorite}>☆</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.left}>
            <Text style={styles.title}>{home.title}</Text>
            <Text style={styles.location}>
              {home.city}, {home.country}
            </Text>
            <Text style={styles.meta}>
              {home.bedrooms ?? 1} {t('bedrooms')} • {home.beds ?? 1} {t('beds')}
            </Text>
          </View>

          <View style={styles.rating}>
            <Star size={13} color="#111" fill="#111" />
            <Text style={styles.ratingText}>
              {home.averageRating ?? 4.6} ({home.reviewsCount ?? 0})
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.available}>{t('available')}</Text>
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
  image: {
    width: '100%',
    height: 360,
    borderRadius: 14,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  favorite: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '300',
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
  price: {
    fontSize: 11,
    fontWeight: '700',
  },
});