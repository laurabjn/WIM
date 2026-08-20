import { useMemo } from 'react';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Mapbox from '@rnmapbox/maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Home } from '@wim/shared/home/home.type';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { searchHomesApi } from '../../home/infrastructure/searchHome.api';
import { getSession } from 'src/auth/infrastructure/authStorage';

import { SearchResultsHeader } from './components/SearchResultsHeader';
import { SearchResultsSheet } from './components/SearchResultsSheet';
import { SearchResultsMap } from './components/SearchResultsMap';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<
  SearchStackParamList,
  'SearchResults'
>;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_COLLAPSED = SCREEN_HEIGHT * 0.48;
const SHEET_EXPANDED = 90;

export const SearchResultsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const { city, capacity, startDate, endDate, category } = route.params ?? {};

  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomeId, setSelectedHomeId] =
    useState<string | null>(null);

  const cameraRef = useRef<Mapbox.Camera>(null);
  const listRef = useRef<FlatList<Home>>(null);

  const sheetY = useRef(
    new Animated.Value(SHEET_COLLAPSED),
  ).current;

  function isHomeAvailable(
    home: Home,
    requestedStartDate?: string,
    requestedEndDate?: string,
  ) {
    if (!requestedStartDate || !requestedEndDate) {
      return true;
    }

    return (
      home.availabilities?.some((availability) => {
        if (availability.type !== 'AVAILABLE') {
          return false;
        }

        return (
          availability.startDate <= requestedStartDate &&
          availability.endDate >= requestedEndDate
        );
      }) ?? false
    );
  }

  useEffect(() => {
    async function loadHomes() {
      setLoading(true);

      try {
        const session = await getSession();

        if (!session?.accessToken) {
          return;
        }

        const data = await searchHomesApi(session.accessToken, {
          city: city?.split(',')[0]?.trim(),
          category,
          startDate,
          endDate,
          capacity,
        });

        setHomes(data);
      } catch (error) {
        console.log('Search homes error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHomes();
  }, [city, capacity, startDate, endDate, category]);

  const moveSheet = useCallback(
    (position: number) => {
      Animated.spring(sheetY, {
        toValue: position,
        useNativeDriver: true,
        tension: 55,
        friction: 10,
      }).start();
    },
    [sheetY],
  );

  const centerCamera = useCallback(
    (home: Home, zoomLevel = 14) => {
      if (
        typeof home.longitude !== 'number' ||
        typeof home.latitude !== 'number'
      ) {
        return;
      }

      cameraRef.current?.setCamera({
        centerCoordinate: [
          home.longitude,
          home.latitude,
        ],
        zoomLevel,
        animationMode: 'flyTo',
        animationDuration: 550,
      });
    },
    [],
  );

  function handleSelectMarker(
    home: Home,
    index: number,
  ) {
    setSelectedHomeId(home.id);
    centerCamera(home);
    moveSheet(SHEET_COLLAPSED);

    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <SearchResultsHeader
        title={city || 'Résultats'}
        onBack={() => navigation.goBack()}
        onOpenFilters={() => {
          console.log('Ouvrir les filtres');
        }}
      />

      <SearchResultsMap
        homes={homes}
        selectedHomeId={selectedHomeId}
        cameraRef={cameraRef}
        onSelectHome={handleSelectMarker}
        onClearSelection={() =>
          setSelectedHomeId(null)
        }
      />

      <SearchResultsSheet
        homes={homes}
        loading={loading}
        selectedHomeId={selectedHomeId}
        sheetY={sheetY}
        listRef={listRef}
        collapsedPosition={SHEET_COLLAPSED}
        expandedPosition={SHEET_EXPANDED}
        onMoveSheet={moveSheet}
        onVisibleHomeChange={(home) => {
          setSelectedHomeId(home.id);
          centerCamera(home, 13.5);
        }}
        onPressHome={(home) => {
          navigation.navigate('HomeDetails', {
            homeId: home.id,
          });
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
});