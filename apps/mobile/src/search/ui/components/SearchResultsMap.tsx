import React, {
  RefObject,
  useEffect,
  useMemo,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Home } from '@wim/shared/home/home.type';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  homes: Home[];
  selectedHomeId: string | null;
  cameraRef: RefObject<Mapbox.Camera | null>;
  onSelectHome: (home: Home, index: number) => void;
  onClearSelection: () => void;
};

export function SearchResultsMap({
  homes,
  selectedHomeId,
  cameraRef,
  onSelectHome,
  onClearSelection,
}: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const homesWithCoordinates = useMemo(
    () =>
      homes.filter(
        (home) =>
          typeof home.latitude === 'number' &&
          Number.isFinite(home.latitude) &&
          typeof home.longitude === 'number' &&
          Number.isFinite(home.longitude),
      ),
    [homes],
  );

  const firstHome = homesWithCoordinates[0];

  const centerCoordinate: [number, number] = firstHome
    ? [
        firstHome.longitude as number,
        firstHome.latitude as number,
      ]
    : [2.3522, 48.8566];

  const mapBounds = useMemo(() => {
    if (homesWithCoordinates.length < 2) {
      return null;
    }

    const longitudes = homesWithCoordinates.map(
      (home) => home.longitude as number,
    );

    const latitudes = homesWithCoordinates.map(
      (home) => home.latitude as number,
    );

    return {
      ne: [
        Math.max(...longitudes),
        Math.max(...latitudes),
      ] as [number, number],

      sw: [
        Math.min(...longitudes),
        Math.min(...latitudes),
      ] as [number, number],
    };
  }, [homesWithCoordinates]);

  useEffect(() => {
    if (homesWithCoordinates.length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      if (
        homesWithCoordinates.length === 1
      ) {
        const onlyHome =
          homesWithCoordinates[0];

        cameraRef.current?.setCamera({
          centerCoordinate: [
            onlyHome.longitude as number,
            onlyHome.latitude as number,
          ],
          zoomLevel: 13.5,
          animationMode: 'flyTo',
          animationDuration: 700,
        });

        return;
      }

      if (mapBounds) {
        cameraRef.current?.fitBounds(
          mapBounds.ne,
          mapBounds.sw,
          70,
          700,
        );
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    cameraRef,
    homesWithCoordinates,
    mapBounds,
  ]);

  return (
    <View style={styles.mapContainer}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled
        compassEnabled
        compassFadeWhenNorth
        scaleBarEnabled={false}
        logoEnabled
        attributionEnabled
        requestDisallowInterceptTouchEvent
        onPress={onClearSelection}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={centerCoordinate}
          zoomLevel={firstHome ? 12 : 4}
          animationMode="flyTo"
          animationDuration={700}
        />

        {homesWithCoordinates.map((home, index) => {
          const selected = home.id === selectedHomeId;

          return (
          <Mapbox.PointAnnotation
            key={home.id}
            id={`home-${home.id}`}
            coordinate={[
              home.longitude as number,
              home.latitude as number,
            ]}
            anchor={{ x: 0.5, y: 1 }}
            onSelected={() => {
              const originalIndex = homes.findIndex(
                item => item.id === home.id,
              );

              onSelectHome(
                home,
                originalIndex >= 0
                  ? originalIndex
                  : index,
              );
            }}
          >
            <View
              collapsable={false}
              style={[
                styles.markerWrapper,
                selected &&
                  styles.markerWrapperSelected,
              ]}
            >
              <View
                style={[
                  styles.marker,
                  selected && styles.markerSelected,
                ]}
              >
                <Text
                  style={[
                    styles.markerNumber,
                    selected &&
                      styles.markerNumberSelected,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <View
                style={[
                  styles.markerArrow,
                  selected &&
                    styles.markerArrowSelected,
                ]}
              />
            </View>
          </Mapbox.PointAnnotation>
          );
        })}
      </Mapbox.MapView>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  markerWrapperSelected: {
    transform: [{ scale: 1.18 }],
  },

  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#25AEEB',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  markerSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.primary,
    borderWidth: 4,
  },

  markerNumber: {
    color: c.onContrast,
    fontSize: 12,
    fontWeight: '900',
  },

  markerNumberSelected: {
    fontSize: 15,
  },

  markerArrow: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#25AEEB',
  },

  markerArrowSelected: {
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 11,
    borderTopColor: c.primary,
  },
});