import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Car,
  ChefHat,
  Dog,
  Trees,
  Waves,
  Wifi,
} from 'lucide-react-native';

type Props = {
  amenities: string[];
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  kitchen: <ChefHat size={26} color="#111111" />,
  garage: <Car size={26} color="#111111" />,
  garden: <Trees size={26} color="#111111" />,
  pets: <Dog size={26} color="#111111" />,
  wifi: <Wifi size={26} color="#111111" />,
  pool: <Waves size={26} color="#111111" />,
};

export function HomeAmenities({ amenities }: Props) {
  const { t } = useTranslation('home');

  const visibleAmenities = amenities.slice(0, 6);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t('amenitiesTitle')}
      </Text>

      {visibleAmenities.length > 0 ? (
        <>
          <View style={styles.featuresGrid}>
            {visibleAmenities.map((item) => {
              const key = item.toLowerCase();
              const icon = AMENITY_ICONS[key] ?? (
                <Text style={styles.fallbackIcon}>•</Text>
              );

              return (
                <View key={item} style={styles.featureRow}>
                  <View style={styles.iconWrapper}>{icon}</View>

                  <Text style={styles.featureText}>
                    {t(`amenities.${key}`, item)}
                  </Text>
                </View>
              );
            })}
          </View>

          {amenities.length > 6 ? (
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineText}>
                {t('showAllAmenities', {
                  count: amenities.length,
                  defaultValue: `Afficher les ${amenities.length} caractéristiques`,
                })}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineText}>
                {t('showAllAmenities', {
                  count: amenities.length,
                  defaultValue: `Afficher les ${amenities.length} caractéristiques`,
                })}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.description}>
          {t('noAmenities', 'Aucun équipement renseigné.')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 22,
  },

  featuresGrid: {
    gap: 18,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    width: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  fallbackIcon: {
    fontSize: 24,
    color: '#111111',
  },

  featureText: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '400',
  },

  outlineButton: {
    marginTop: 24,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333333',
  },
});