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
    if (!mapBounds) return;

    const timeout = setTimeout(() => {
      cameraRef.current?.fitBounds(
        mapBounds.ne,
        mapBounds.sw,
        70,
        700,
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [cameraRef, mapBounds]);

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
            <Mapbox.MarkerView
              key={home.id}
              coordinate={[
                home.longitude as number,
                home.latitude as number,
              ]}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
            >
              <Pressable
                hitSlop={12}
                onPress={(event) => {
                  event.stopPropagation();

                  const originalIndex = homes.findIndex(
                    (item) => item.id === home.id,
                  );

                  onSelectHome(
                    home,
                    originalIndex >= 0
                      ? originalIndex
                      : index,
                  );
                }}
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
              </Pressable>
            </Mapbox.MarkerView>
          );
        })}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#087EBE',
    borderWidth: 4,
  },

  markerNumber: {
    color: '#fff',
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
    borderTopColor: '#087EBE',
  },
});