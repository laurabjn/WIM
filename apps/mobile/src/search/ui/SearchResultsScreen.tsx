import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ArrowLeft, SlidersHorizontal, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { searchHomesApi } from 'src/home/infrastructure/searchHome.api';
import { Home } from '@wim/shared/home/home.type';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchResultCard } from './components/SearchResultCard';
import { searchHomesMock } from '../infrastructure/mocks/searchHomeMocks';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchResults'>;

export const SearchResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { city, startDate, endDate, capacity } = route.params ?? {};

  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  const SHEET_COLLAPSED = 300;
  const SHEET_EXPANDED = 90;

  const sheetY = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const lastSheetY = useRef(SHEET_COLLAPSED);

  const moveSheet = (toValue: number) => {
    lastSheetY.current = toValue;

    Animated.spring(sheetY, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const nextY = lastSheetY.current + gestureState.dy;

        if (nextY >= SHEET_EXPANDED && nextY <= SHEET_COLLAPSED) {
          sheetY.setValue(nextY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldExpand =
          gestureState.dy < -40 || gestureState.vy < -0.5;

        const shouldCollapse =
          gestureState.dy > 40 || gestureState.vy > 0.5;

        if (shouldExpand) {
          moveSheet(SHEET_EXPANDED);
          return;
        }

        if (shouldCollapse) {
          moveSheet(SHEET_COLLAPSED);
          return;
        }

        const middle = (SHEET_COLLAPSED + SHEET_EXPANDED) / 2;
        const currentY = lastSheetY.current + gestureState.dy;

        moveSheet(currentY < middle ? SHEET_EXPANDED : SHEET_COLLAPSED);
      },
    }),
  ).current;
    
  function toApiDate(date?: string | Date | null) {
    if (!date) return undefined;

    if (typeof date === 'string') {
        return date;
  }

  return date.toISOString().split('T')[0];
}

  useEffect(() => {
    async function loadResults() {
      const session = await getSession();

      if (!session?.accessToken) return;

      // const data = await searchHomesApi(session.accessToken, {
      //   city,
      //   startDate: toApiDate(startDate),
      //   endDate: toApiDate(endDate),
      //   capacity,
      // });
      const data = searchHomesMock

      setHomes(data);
      setLoading(false);
    }

    loadResults();
  }, [city, startDate, endDate, capacity]);

  const firstHome = homes.find((home) => home.latitude && home.longitude);

  const region = {
    latitude: firstHome?.latitude ?? 37.7749,
    longitude: firstHome?.longitude ?? -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>{city}</Text>

        <TouchableOpacity style={styles.iconButton}>
          <SlidersHorizontal size={18} color="#111" />
        </TouchableOpacity>
      </View>

      <MapView style={styles.map} initialRegion={region}>
        {homes
          .filter((home) => home.latitude && home.longitude)
          .map((home) => (
            <Marker
              key={home.id}
              coordinate={{
                latitude: home.latitude!,
                longitude: home.longitude!,
              }}
              onPress={() => console.log(`Marker pressed: ${home.title}`)}
            />
          ))}
      </MapView>
      
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: sheetY }],
          },
        ]}
      >
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragBar} />
          <Text style={styles.resultsCount}>{homes.length} Résultats</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
            <Animated.ScrollView
              contentContainerStyle={styles.results}
              showsVerticalScrollIndicator={false}
            >
            {homes.map((home) => (
              <SearchResultCard
                key={home.id}
                home={home}
                onPress={() => console.log("home detail")}
              />
            ))}
          </Animated.ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  dragBar: {
    alignSelf: 'center',
    marginTop: 8,
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111',
  },
  resultsCount: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 10,
    fontSize: 12,
    color: '#555',
  },
  results: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 18,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 14,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '800',
  },
  location: {
    marginTop: 2,
    fontSize: 12,
    color: '#555',
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
    color: '#444',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
});