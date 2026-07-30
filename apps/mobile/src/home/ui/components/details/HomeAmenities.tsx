import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Dog,
  Palmtree,
  Trees,
  Umbrella,
  Wifi,
  CircleParking,
  Dumbbell,
  Binoculars,
  AirVent 
} from 'lucide-react-native';
import {
  getAmenityIcon,
  normalizeAmenity,
} from '../../../../utils/amenityIcons';

type Props = {
  amenities: string[];
};

type AmenityIconProps = {
  size?: number;
  color?: string;
};

const VISIBLE_AMENITIES_LIMIT = 6;

const AMENITY_ICONS: Record<
  string,
  React.ComponentType<AmenityIconProps>
> = {
  wifi: Wifi,
  plage: Umbrella,
  terrasse: Palmtree,
  jardin: Trees,
  animaux: Dog,
  parking: CircleParking,
  vue: Binoculars,
  sport: Dumbbell,
  climatisation: AirVent 
};

export function HomeAmenities({
  amenities,
}: Props) {
  const { t } = useTranslation('home');
console.log(amenities)
  const [showAll, setShowAll] =
    useState(false);

  const displayedAmenities = showAll
    ? amenities
    : amenities.slice(
        0,
        VISIBLE_AMENITIES_LIMIT,
      );

  const hasHiddenAmenities =
    amenities.length >
    VISIBLE_AMENITIES_LIMIT;

  function handleToggleAmenities() {
    setShowAll(current => !current);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t('amenitiesTitle')}
      </Text>

      {displayedAmenities.length > 0 ? (
        <>
          <View style={styles.featuresGrid}>
            {displayedAmenities.map(
              (item, index) => {
                const key = normalizeAmenity(item)

                const Icon = getAmenityIcon(item);

                return (
                  <View
                    key={`${key}-${index}`}
                    style={
                      styles.featureRow
                    }
                  >
                    <View
                      style={
                        styles.iconWrapper
                      }
                    >
                      {Icon ? (
                        <Icon
                          size={26}
                          color="#111111"
                        />
                      ) : (
                        <Text
                          style={
                            styles.fallbackIcon
                          }
                        >
                          •
                        </Text>
                      )}
                    </View>

                    <Text
                      style={
                        styles.featureText
                      }
                    >
                      {t(
                        `amenities.${key}`,
                        {
                          defaultValue:
                            item,
                        },
                      )}
                    </Text>
                  </View>
                );
              },
            )}
          </View>

          {hasHiddenAmenities && (
            <TouchableOpacity
              style={
                styles.outlineButton
              }
              activeOpacity={0.8}
              onPress={
                handleToggleAmenities
              }
            >
              <Text
                style={
                  styles.outlineText
                }
              >
                {showAll
                  ? t(
                      'hideAmenities',
                      {
                        defaultValue:
                          'Réduire',
                      },
                    )
                  : t(
                      'showAllAmenities',
                      {
                        count:
                          amenities.length,
                        defaultValue: `Afficher les ${amenities.length} caractéristiques`,
                      },
                    )}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.description}>
          {t('noAmenities', {
            defaultValue:
              'Aucun équipement renseigné.',
          })}
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
    marginBottom: 22,
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
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
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#111111',
  },

  outlineButton: {
    marginTop: 24,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    paddingHorizontal: 16,
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