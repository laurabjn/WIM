import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking
} from 'react-native';
import Mapbox from '@rnmapbox/maps';

const RAYON_KM = 5;

function zoneApprochee(longitude: number, latitude: number) {
  const degresParKmEnLongitude =
    1 / (111.32 * Math.cos((latitude * Math.PI) / 180));
  const degresParKmEnLatitude = 1 / 110.574;

  const anneau: number[][] = [];

  for (let pas = 0; pas < 72; pas += 1) {
    const angle = (pas / 72) * 2 * Math.PI;

    anneau.push([
      longitude + RAYON_KM * degresParKmEnLongitude * Math.cos(angle),
      latitude + RAYON_KM * degresParKmEnLatitude * Math.sin(angle),
    ]);
  }

  anneau.push(anneau[0]);

  return {
    contour: {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Polygon' as const, coordinates: [anneau] },
    },
    coinNordEst: [
      longitude + RAYON_KM * degresParKmEnLongitude,
      latitude + RAYON_KM * degresParKmEnLatitude,
    ] as [number, number],
    coinSudOuest: [
      longitude - RAYON_KM * degresParKmEnLongitude,
      latitude - RAYON_KM * degresParKmEnLatitude,
    ] as [number, number],
  };
}
import { MapPin } from 'lucide-react-native';
import { Home } from '@wim/shared/home/home.type';
import { useTranslation } from 'react-i18next';
import { getLocationDescription, LocationDescription } from 'src/home/infrastructure/locationDescription.api';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  home: Home;
};

export function HomeLocationMap({ home }: Props) {
  const { t } = useTranslation(['home']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

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

  const zone = useMemo(
    () => (coordinate ? zoneApprochee(coordinate[0], coordinate[1]) : null),
    [coordinate],
  );

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
          home.country,
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

      {coordinate && zone ? (
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
              bounds={{
                ne: zone.coinNordEst,
                sw: zone.coinSudOuest,
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 24,
                paddingRight: 24,
              }}
              animationMode="flyTo"
              animationDuration={600}
            />

            <Mapbox.ShapeSource id="zoneDuLogement" shape={zone.contour}>
              <Mapbox.FillLayer
                id="zoneDuLogementFond"
                style={{ fillColor: '#087EBE', fillOpacity: 0.14 }}
              />
              <Mapbox.LineLayer
                id="zoneDuLogementBord"
                style={{ lineColor: '#087EBE', lineWidth: 2, lineOpacity: 0.6 }}
              />
            </Mapbox.ShapeSource>
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

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: c.text,
    marginBottom: 12,
  },
  mapContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  mapUnavailable: {
    height: 160,
    borderRadius: 16,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mapUnavailableText: {
    fontSize: 13,
    color: c.textMuted,
    fontWeight: '600',
  },
  locationTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  locationAddress: {
    fontSize: 13,
    lineHeight: 19,
    color: c.textMuted,
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
    color: c.textMuted,
    textTransform: 'capitalize',
  },
  locationDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: c.text,
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
    color: c.text,
    textDecorationLine: 'underline',
  },
  sourceText: {
    marginTop: 8,
    fontSize: 10,
    color: c.textMuted,
  },
});