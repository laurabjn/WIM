import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function HomeLocationSection({
  city,
  country,
}: Props) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Où se situe le logement
      </Text>

      <View style={styles.map}>
        <Text style={styles.pin}>📍</Text>
      </View>

      <Text style={styles.location}>
        {city}, {country}
      </Text>

      <Text style={styles.description}>
        Découvrez le quartier, les commerces et les lieux à proximité du logement.
      </Text>

      <Text style={styles.readMore}>
        Lire la suite ›
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 14,
  },

  map: {
    height: 280,
    borderRadius: 26,
    backgroundColor: '#DCEBFA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  pin: {
    fontSize: 38,
  },

  location: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 28,
    color: '#3A3A3A',
  },

  readMore: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: '#111111',
  },
});