import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MapPin } from 'lucide-react-native';
import { Home } from '@wim/shared/home/home.type';
import { useTranslation } from 'react-i18next';
import { getLocationDescription, LocationDescription } from 'src/home/infrastructure/locationDescription.api';

type Props = {
  home: Home;
};

export function HomeLocationMap({ home }: Props) {
  const { t } = useTranslation(['home']);

  const [locationDescription, setLocationDescription] =
    useState<LocationDescription | null>(null);

  const [isDescriptionLoading, setIsDescriptionLoading] =
    useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const hasCoordinates =
    typeof home.latitude === 'number' &&
    Number.isFinite(home.latitude) &&
    typeof home.longitude === 'number' &&
    Number.isFinite(home.longitude);

  const coordinate: [number, number] | null =
    hasCoordinates
      ? [home.longitude!, home.latitude!]
      : null;

  const locationLabel = [home.city, home.country]
    .filter(Boolean)
    .join(', ');
  
  useEffect(() => {
    let cancelled = false;

    async function loadDescription() {
      if (!home.city) {
        setLocationDescription(null);
        return;
      }

      try {
        setIsDescriptionLoading(true);

        const data = await getLocationDescription(
          home.city,
          home.latitude,
          home.longitude,
          'fr',
        );

        console.log('LOCATION DESCRIPTION', data);

        if (!cancelled) {
          setLocationDescription(data);
        }
      } catch (error) {
        console.log(
          'Location description error:',
          error,
        );

        if (!cancelled) {
          setLocationDescription(null);
        }
      } finally {
        if (!cancelled) {
          setIsDescriptionLoading(false);
        }
      }
    }

    loadDescription();

    return () => {
      cancelled = true;
    };
  }, [home.city]);

  return (
    <View>
      <Text style={styles.sectionTitle}>
        {t('locationTitle')}
      </Text>

      {coordinate ? (
        <View style={styles.mapContainer}>
          <Mapbox.MapView
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
            scrollEnabled
            zoomEnabled
            rotateEnabled={false}
            pitchEnabled={false}
            compassEnabled
            scaleBarEnabled={false}
            logoEnabled
            attributionEnabled
            requestDisallowInterceptTouchEvent
          >
            <Mapbox.Camera
              centerCoordinate={coordinate}
              zoomLevel={13}
              animationMode="flyTo"
              animationDuration={600}
            />

            <Mapbox.MarkerView
              coordinate={coordinate}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
            >
              <View style={styles.markerWrapper}>
                <View style={styles.marker}>
                  <MapPin
                    size={18}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.markerArrow} />
              </View>
            </Mapbox.MarkerView>
          </Mapbox.MapView>
        </View>
      ) : (
        <View style={styles.mapUnavailable}>
          <MapPin size={24} color="#777" />

          <Text style={styles.mapUnavailableText}>
            {t('coordinatesUnavailable')}
          </Text>
        </View>
      )}

      <Text style={styles.locationTitle}>
        {locationLabel ||
          t('unknownLocation')}
      </Text>

      {home.address ? (
        <Text style={styles.locationAddress}>
          {home.address}
        </Text>
      ) : null}

      {isDescriptionLoading ? (
        <ActivityIndicator
          size="small"
          style={styles.descriptionLoader}
        />
      ) : null}

      {locationDescription?.extract ? (
        <View style={styles.descriptionContainer}>
          {locationDescription.description ? (
            <Text style={styles.locationSubtitle}>
              {locationDescription.description}
            </Text>
          ) : null}

          <Text
            style={styles.locationDescription}
            numberOfLines={isExpanded ? undefined : 3}
          >
            {locationDescription.extract}
          </Text>

          <View style={styles.descriptionActions}>
            <TouchableOpacity
              onPress={() =>
                setIsExpanded((current) => !current)
              }
            >
              <Text style={styles.readMore}>
                {isExpanded
                  ? t('reduce')
                  : t('readMore')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sourceText}>
            {t('source')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  mapContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8EEF3',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#25AEEB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  markerArrow: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#25AEEB',
  },
  mapUnavailable: {
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mapUnavailableText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  locationTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  locationAddress: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
  descriptionLoader: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  descriptionContainer: {
    marginTop: 14,
  },
  locationSubtitle: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  locationDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333333',
  },
  descriptionActions: {
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    textDecorationLine: 'underline',
  },
  sourceText: {
    marginTop: 8,
    fontSize: 10,
    color: '#9CA3AF',
  },
});