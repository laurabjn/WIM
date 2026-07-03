import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';

export function SwipeHomeCard({ home }: any) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: home.photos[0].url }} style={styles.image} />

      <View style={styles.avatar}>
        <Image source={{ uri: home.photos[1].url }} style={styles.avatarImage} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.left}>
          <Text style={styles.title}>{home.title} 🔵</Text>
          <Text style={styles.location}>{home.city}, {home.country}</Text>
          <Text style={styles.meta}>{home.bedrooms} chambres • {home.beds} lits</Text>
        </View>

        <View style={styles.rating}>
          <Star size={13} color="#111" fill="#111" />
          <Text style={styles.ratingText}>{home.averageRating} ({home.reviewsCount})</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.available}>Disponible</Text>
        <Text style={styles.price}>✈ à partir de {home.pricePerNight}€</Text>
      </View>

      <View style={styles.tags}>
        {home.amenities.map((tag: string) => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 430,
    borderRadius: 14,
  },
  avatar: {
    position: 'absolute',
    left: 22,
    top: 390,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  infoRow: {
    marginTop: 12,
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
    color: '#333',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111',
  },
  statusRow: {
    marginTop: 10,
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
    color: '#111',
  },
  tags: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#FFE27A',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '800',
    color: '#3D2A00',
  },
});