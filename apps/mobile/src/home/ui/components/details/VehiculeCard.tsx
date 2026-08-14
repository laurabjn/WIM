import { Vehicule } from '@wim/shared/home/home.type';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  vehicle?: Vehicule | null;
};

export const VehicleCard: React.FC<Props> = ({ vehicle }) => {
  const { t } = useTranslation("home");
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  if (!vehicle) return null;

  const vehicleName = [vehicle.brand, vehicle.model].filter(Boolean).join(' ');

  function getFuelTypeLabel(fuelType?: string | null) {
    switch (fuelType) {
      case 'GASOLINE':
        return 'Essence';
      case 'HYBRID':
        return 'Hybride';
      case 'DIESEL':
        return 'Diesel';
      case 'ELECTRIC':
        return 'Électrique';
      default:
        return null;
    }
  }

  const fuelLabel = getFuelTypeLabel(vehicle.fuelType);

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
          {fuelLabel ? (
            <Text style={styles.fuelType}>
              {fuelLabel}
            </Text>
          ) : null}
        </Text>

        <Text style={styles.text}>
          {vehicleName || t('vehicule.notProvided')}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: c.surface,
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
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  fuelType: {
    fontSize: 12,
    color: c.textMuted,
    marginTop: 4,
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
    backgroundColor: c.surfaceAlt,
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
    color: c.text,
    marginBottom: 6,
  },

  text: {
    fontSize: 12,
    color: c.text,
    marginBottom: 2,
  },
});