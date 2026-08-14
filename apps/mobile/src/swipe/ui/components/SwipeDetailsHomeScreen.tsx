import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {

  Heart,
  Home as HomeIcon,
} from 'lucide-react-native';
import Mapbox from '@rnmapbox/maps';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Home } from '@wim/shared/home/home.type';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { getHomeById } from 'src/home/infrastructure/home.api';

import { SearchResultsMap } from 'src/search/ui/components/SearchResultsMap';
import { useTranslation } from 'react-i18next';
import { HomeSummary } from 'src/home/ui/components/details/HomeSummary';
import { HostSummary } from 'src/home/ui/components/details/HostSummary';
import { VehicleCard } from 'src/home/ui/components/details/VehiculeCard';
import { HomeAmenities } from 'src/home/ui/components/details/HomeAmenities';
import { HomeReviews } from 'src/home/ui/components/details/HomeReviews';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { addFavoriteHome, listFavoriteHomes, removeFavoriteHome } from 'src/home/infrastructure/home.api';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_COLLAPSED = SCREEN_HEIGHT * 0.46;
const SHEET_EXPANDED = 85;
const PHOTO_WIDTH = SCREEN_WIDTH - 36;

type Props = NativeStackScreenProps<
  SearchStackParamList,
  'SwipeHomeDetails'
>;

const fallbackPhoto = {
  id: 'fallback-photo',
  url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
};

export function SwipeDetailHomeScreen({
  navigation,
  route,
}: Props) {
  const { t } = useTranslation("swipe");
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const { homeId } = route.params;
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Mapbox.Camera>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const reviewsPositionRef = useRef(0);
  const sheetY = useRef(
    new Animated.Value(SHEET_COLLAPSED),
  ).current;
  const sheetPositionRef = useRef(SHEET_COLLAPSED);

  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [home, setHome] = useState<Home | undefined>(undefined);
  const [isHomeLoading, setIsHomeLoading] = useState(true);

  const photos = useMemo(() => {
    if (!home?.photos?.length) {
      return [fallbackPhoto];
    }

    return home.photos;
  }, [home]);

  const moveSheet = useCallback(
    (position: number) => {
      sheetPositionRef.current =
        position;

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
    (
      selectedHome: Home,
      zoomLevel = 13.5,
    ) => {
      if (
        typeof selectedHome.longitude !==
          'number' ||
        typeof selectedHome.latitude !==
          'number'
      ) {
        return;
      }

      cameraRef.current?.setCamera({
        centerCoordinate: [
          selectedHome.longitude,
          selectedHome.latitude,
        ],
        zoomLevel,
        animationMode: 'flyTo',
        animationDuration: 550,
      });
    },
    [],
  );

  useEffect(() => {
    if (!home) {
      return;
    }

    const timer = setTimeout(() => {
      centerCamera(home);
    }, 300);

    return () => clearTimeout(timer);
  }, [centerCamera, home]);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      try {
        const session = await getSession();

        if (!session?.accessToken || cancelled) return;

        const loaded = await getHomeById(session.accessToken, homeId);

        if (!cancelled) setHome(loaded);
      } catch (loadError) {
        console.log('Load home error:', loadError);
      } finally {
        if (!cancelled) setIsHomeLoading(false);
      }
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, [homeId]);

  useEffect(() => {
    async function loadSession() {
        try {
            const session = await getSession();
            setToken(session?.accessToken ?? null);
            console.log('Loaded session:', session);
        } catch (error) {
            console.log('Error loading session:', error);
            setToken(null);
        } finally {
            setIsSessionLoading(false);
        }
    }

    loadSession();
  }, []);

  useEffect(() => {
    if (!token || !home) {
      return;
    }

    const accessToken = token;

    let cancelled = false;

    async function loadFavoriteStatus() {
      try {
        const favoriteHomes = await listFavoriteHomes(accessToken);

        const isAlreadyFavorite =
          favoriteHomes.some(
            favoriteHome =>
              favoriteHome.id === home!.id,
          );

        if (!cancelled) {
          setIsFavorite(
            isAlreadyFavorite,
          );
        }
      } catch (error) {
        console.log(
          'Load favorite status error:',
          error,
        );
      }
    }

    loadFavoriteStatus();

    return () => {
      cancelled = true;
    };
  }, [token, home]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (
          _,
          gesture,
        ) => {
          return (
            Math.abs(gesture.dy) > 8 &&
            Math.abs(gesture.dy) >
              Math.abs(gesture.dx)
          );
        },

        onPanResponderGrant: () => {
          sheetY.stopAnimation(
            currentValue => {
              sheetPositionRef.current =
                currentValue;
            },
          );
        },

        onPanResponderMove: (
          _,
          gesture,
        ) => {
          const nextPosition =
            sheetPositionRef.current +
            gesture.dy;

          const boundedPosition =
            Math.min(
              SHEET_COLLAPSED,
              Math.max(
                SHEET_EXPANDED,
                nextPosition,
              ),
            );

          sheetY.setValue(
            boundedPosition,
          );
        },

        onPanResponderRelease: (
          _,
          gesture,
        ) => {
          const currentPosition =
            sheetPositionRef.current +
            gesture.dy;

          const middlePosition =
            (SHEET_COLLAPSED +
              SHEET_EXPANDED) /
            2;

          if (
            gesture.vy < -0.5 ||
            currentPosition <
              middlePosition
          ) {
            moveSheet(SHEET_EXPANDED);
            return;
          }

          moveSheet(SHEET_COLLAPSED);
        },

        onPanResponderTerminate: () => {
          moveSheet(
            sheetPositionRef.current,
          );
        },
      }),
    [moveSheet, sheetY],
  );

  function handlePhotoScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        PHOTO_WIDTH,
    );

    setPhotoIndex(nextIndex);
  }

  function handleBack() {
    navigation.goBack();
  }

  function handlePressReviews() {
    moveSheet(SHEET_EXPANDED);

    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: reviewsPositionRef.current,
          animated: true,
        });
      }, 250);
    });
  }

  async function toggleFavorite() {
    if (
      !token ||
      !home ||
      isFavoriteLoading
    ) {
      return;
    }

    const previousValue = isFavorite;
    const nextValue = !previousValue;

    setIsFavorite(nextValue);
    setIsFavoriteLoading(true);

    try {
      if (nextValue) {
        await addFavoriteHome(
          token,
          home.id,
        );
      } else {
        await removeFavoriteHome(
          token,
          home.id,
        );
      }
    } catch (error) {
      setIsFavorite(previousValue);

      console.log(
        'Toggle favorite error:',
        error,
      );
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  if (isHomeLoading) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <ActivityIndicator color="#087EBE" />
      </SafeAreaView>
    );
  }

  if (!home) {
    return (
      <SafeAreaView
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyTitle}>
          {t('homeNotFound')}
        </Text>

        <Text style={styles.emptyText}>
          {t('homenotAvailable')}
        </Text>
      </SafeAreaView>
    );
  }

  const averageRating = home.averageRating ?? 0;
  const reviewsCount = home.reviewsCount ?? 0;
  const amenities = home.amenities ?? [];
  const ownerName = [
    home.owner?.firstName,
    home.owner?.lastName,
  ]
  .filter(Boolean)
  .join(' ') || 'Propriétaire';
  const ownerAvatar =
    home.owner?.avatarUrl ??
    photos[0].url;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <View style={styles.header}>
        <BackButton onPress={handleBack} style={styles.iconButton} />
      </View>

      <SearchResultsMap
        homes={[home]}
        selectedHomeId={home.id}
        cameraRef={cameraRef}
        onSelectHome={selectedHome => {
          centerCamera(selectedHome);
          moveSheet(
            SHEET_COLLAPSED,
          );
        }}
        onClearSelection={() => {}}
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [
              {
                translateY: sheetY,
              },
            ],
          },
        ]}
      >
        <View
          style={styles.dragArea}
          {...panResponder.panHandlers}
        >
          <View
            style={styles.dragHandle}
          />

          <View
            style={
              styles.sheetHeaderRow
            }
          >
            <View style={styles.headerText}>
              <Text
                style={
                  styles.sheetSmallTitle
                }
              >
                {home.city},{' '}
                {home.country}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.favoriteButton,
                isFavoriteLoading &&
                styles.favoriteButtonDisabled,
              ]}
              onPress={toggleFavorite}
              disabled={
                isFavoriteLoading ||
                isSessionLoading ||
                !token
              }
              activeOpacity={0.7}
            >
              <Heart
                size={21}
                color={
                  isFavorite
                    ? '#FF4F70'
                    : '#111111'
                }
                fill={
                  isFavorite
                    ? '#FF4F70'
                    : 'transparent'
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={
            false
          }
          nestedScrollEnabled
          contentContainerStyle={[
            styles.sheetContent,
            {
              paddingBottom:
                130 + insets.bottom,
            },
          ]}
        >
          <View
            style={
              styles.carouselContainer
            }
          >
            <ScrollView
              horizontal
              pagingEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={
                false
              }
              onMomentumScrollEnd={
                handlePhotoScrollEnd
              }
            >
              {photos.map(
                (
                  photo: {
                    id?: string;
                    url: string;
                  },
                  index: number,
                ) => (
                  <Image
                    key={
                      photo.id ??
                      `${photo.url}-${index}`
                    }
                    source={{
                      uri: photo.url,
                    }}
                    style={
                      styles.carouselImage
                    }
                  />
                ),
              )}
            </ScrollView>

            {photos.length > 1 && (
              <View
                style={
                  styles.pagination
                }
              >
                {photos.map(
                  (
                    _: unknown,
                    index: number,
                  ) => (
                    <View
                      key={`photo-dot-${index}`}
                      style={[
                        styles.paginationDot,
                        index ===
                          photoIndex &&
                          styles.paginationDotActive,
                      ]}
                    />
                  ),
                )}
              </View>
            )}

            <View
              style={
                styles.photoCounter
              }
            >
              <Text
                style={
                  styles.photoCounterText
                }
              >
                {photoIndex + 1}/
                {photos.length}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <HomeSummary
              home={home}
              onPressReviews={handlePressReviews}
            />

            <View
              style={styles.separator}
            />

            <HostSummary
              owner={home.owner}
              onPress={() => console.log("oui")}
            />

            <View
              style={styles.separator}
            />

            <SectionTitle title="À propos de ce logement" />

            <Text
              style={styles.description}
            >
              {home.description ??
                'Aucune description disponible pour ce logement.'}
            </Text>

            {home.isAvailableForExchange && home.vehicle ? (
              <View style={{ flex: 1, paddingTop: 16 }}>
                <VehicleCard vehicle={home.vehicle} />
              </View>
            ) : null}
  
            <View style={styles.separator} />
            
            <HomeAmenities amenities={home.amenities ?? []} /> 
            <View style={styles.separator} />
  
            <View
              onLayout={event => {
                reviewsPositionRef.current =
                  event.nativeEvent.layout.y;
              }}
            >
              <HomeReviews
                onPressAuthor={(userId) =>
                  navigation.navigate('PublicProfile', { userId })
                }
                reviews={home.reviews ?? []}
                averageRating={home.averageRating}
                reviewsCount={home.reviewsCount ?? 0}
              />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  // Ce titre vit hors du composant principal : il lui faut sa propre palette.
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
    
  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.surface,
    zIndex: 20,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  favoriteButtonDisabled: {
    opacity: 0.5,
  },

  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: c.surface,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: -5,
    },
    elevation: 18,
  },

  dragArea: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: c.surface,
  },

  dragHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D2D2D2',
  },

  sheetHeaderRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerText: {
    flex: 1,
  },

  sheetSmallTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: c.text,
  },

  sheetInstruction: {
    marginTop: 2,
    fontSize: 11,
    color: '#777777',
  },

  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetContent: {
    paddingTop: 4,
  },

  carouselContainer: {
    width: PHOTO_WIDTH,
    height: 270,
    marginHorizontal: 18,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#EEEEEE',
  },

  carouselImage: {
    width: PHOTO_WIDTH,
    height: 270,
    resizeMode: 'cover',
  },

  pagination: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor:
      'rgba(255,255,255,0.55)',
  },

  paginationDotActive: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: c.surface,
  },

  photoCounter: {
    position: 'absolute',
    right: 12,
    top: 12,
    minWidth: 46,
    height: 27,
    borderRadius: 14,
    paddingHorizontal: 9,
    backgroundColor:
      'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoCounterText: {
    color: c.onContrast,
    fontSize: 11,
    fontWeight: '800',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
    gap: 12,
  },

  titleArea: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    color: c.text,
  },

  locationRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  location: {
    flex: 1,
    fontSize: 14,
    color: '#5F5F5F',
  },

  rating: {
    minWidth: 65,
    height: 34,
    borderRadius: 17,
    backgroundColor: c.surfaceAlt,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: c.text,
  },

  reviewText: {
    marginTop: 8,
    fontSize: 14,
    color: '#686868',
    textDecorationLine:
      'underline',
  },

  separator: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 24,
  },

  summaryGrid: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  summaryItem: {
    width: '24%',
    alignItems: 'center',
  },

  summaryIcon: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '900',
    color: c.text,
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: '#696969',
    textAlign: 'center',
  },

  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  hostAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EEEEEE',
  },

  hostInfo: {
    flex: 1,
    marginLeft: 14,
  },

  hostLabel: {
    fontSize: 13,
    color: '#6B6B6B',
  },

  hostName: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '900',
    color: c.text,
  },

  hostDescription: {
    marginTop: 3,
    fontSize: 13,
    color: '#737373',
  },

  sectionTitle: {
    marginBottom: 16,
    fontSize: 21,
    fontWeight: '900',
    color: c.text,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: c.text,
  },

  homeTypeCard: {
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: '#F7F7F7',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  homeTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  homeTypeText: {
    flex: 1,
    marginLeft: 14,
  },

  homeTypeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: c.text,
  },

  homeTypeSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#696969',
  },

  amenitiesContainer: {
    gap: 14,
  },

  amenityItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },

  amenityIcon: {
    width: 40,
    alignItems: 'flex-start',
  },

  amenityText: {
    flex: 1,
    fontSize: 15,
    color: '#222222',
  },

  emptySectionText: {
    fontSize: 14,
    color: '#777777',
  },

  availabilityCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  availabilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF9F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  availabilityText: {
    flex: 1,
    marginHorizontal: 14,
  },

  availabilityTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: c.text,
  },

  availabilitySubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#696969',
  },

  carRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  carIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  carText: {
    flex: 1,
    marginLeft: 14,
  },

  carTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: c.text,
  },

  carSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: '#696969',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    borderTopWidth: 1,
    borderTopColor: '#E9E9E9',
    backgroundColor: c.surface,
    paddingTop: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    elevation: 20,
  },

  dislikeButton: {
    width: 125,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  dislikeButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: c.danger,
  },

  likeButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#41D086',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  likeButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: c.onContrast,
  },

  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: c.text,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: c.textMuted,
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 20,
    height: 46,
    borderRadius: 23,
    backgroundColor: c.contrast,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    color: c.onContrast,
    fontSize: 14,
    fontWeight: '800',
  },
});