import { Vehicule } from '@wim/shared/home/home.type';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  vehicle?: Vehicule | null;
};

export const VehicleCard: React.FC<Props> = ({ vehicle }) => {
  const { t } = useTranslation("home");
  if (!vehicle) return null;

  const vehicleName = [vehicle.brand, vehicle.model].filter(Boolean).join(' ');

  return (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        {vehicle.imageUrl ? (
          <Image
            source={{ uri: vehicle.imageUrl }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.vehicleImagePlaceholder}>
            <Text style={styles.image}>🚗</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t('vehicule.exchangeAccepted')}</Text>

        <Text style={styles.text}>
          {vehicle.seats ? `${vehicle.seats} ${t('vehicule.places')}` : t('vehicule.numberOfPlaces')}
          {vehicle.type ? ` · ${vehicle.type}` : ''}
        </Text>

        <Text style={styles.text}>
          {vehicleName || t('vehicule.notProvided')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  imageBox: {
    width: 92,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  vehicleImage: {
    width: 90,
    height: 70,
    borderRadius: 12,
  },

  vehicleImagePlaceholder: {
    width: 90,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: 82,
    height: 56,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },

  text: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 2,
  },
});