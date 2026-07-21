import React, {
  useMemo,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Heart,
  MapPin,
  Share2,
  Star,
  Users,
  X,
} from 'lucide-react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SwipeStackParamList } from 'src/navigation/type/swipeTabs';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233';

type Props = NativeStackScreenProps<SwipeStackParamList,'SwipeHomeDetails'>;

export function SwipeHomeDetailsScreen({
  navigation,
  route,
}: Props) {
  const { t } = useTranslation([
    'profile',
    'home',
    'swipe',
  ]);

  const { home } = route.params;

  const [photoIndex, setPhotoIndex] =
    useState(0);

  const photos = useMemo(() => {
    if (
      home.photos &&
      home.photos.length > 0
    ) {
      return home.photos;
    }

    return [
      {
        id: 'fallback-photo',
        url: FALLBACK_IMAGE,
        position: 0,
      },
    ];
  }, [home.photos]);

  function handleCarouselScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        SCREEN_WIDTH,
    );

    setPhotoIndex(nextIndex);
  }

  function handleLike() {
    navigation.navigate('Swipe', {
      processedHomeId: home.id,
      action: 'like',
    });
  }

  function handleDislike() {
    navigation.navigate('Swipe', {
      processedHomeId: home.id,
      action: 'dislike',
    });
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `${home.title} — ${home.city}, ${home.country}`,
      });
    } catch (error) {
      console.error(
        'Unable to share home',
        error,
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={
                false
              }
              onMomentumScrollEnd={
                handleCarouselScrollEnd
              }
              scrollEventThrottle={16}
            >
              {photos.map(
                (photo, index) => (
                  <Image
                    key={
                      photo.id ??
                      `${photo.url}-${index}`
                    }
                    source={{
                      uri:
                        photo.url ??
                        FALLBACK_IMAGE,
                    }}
                    style={styles.carouselImage}
                  />
                ),
              )}
            </ScrollView>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.goBack()
                }
              >
                <ArrowLeft
                  size={22}
                  color="#111111"
                  strokeWidth={2.4}
                />
              </TouchableOpacity>

              <View
                style={
                  styles.headerRightActions
                }
              >
                <TouchableOpacity
                  style={styles.headerButton}
                  activeOpacity={0.8}
                  onPress={handleShare}
                >
                  <Share2
                    size={20}
                    color="#111111"
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headerButton}
                  activeOpacity={0.8}
                  onPress={handleLike}
                >
                  <Heart
                    size={21}
                    color="#111111"
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {photos.length > 1 && (
              <View style={styles.pagination}>
                {photos.map(
                  (_, index) => (
                    <View
                      key={`dot-${index}`}
                      style={[
                        styles.paginationDot,
                        photoIndex === index &&
                          styles.paginationDotActive,
                      ]}
                    />
                  ),
                )}
              </View>
            )}

            <View style={styles.photoCounter}>
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
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  {home.title}
                </Text>

                <View
                  style={styles.locationRow}
                >
                  <MapPin
                    size={15}
                    color="#656565"
                  />

                  <Text
                    style={styles.location}
                  >
                    {home.city},{' '}
                    {home.country}
                  </Text>
                </View>
              </View>

              <View style={styles.rating}>
                <Star
                  size={16}
                  color="#111111"
                  fill="#111111"
                />

                <Text
                  style={styles.ratingText}
                >
                  {home.averageRating ??
                    4.6}
                </Text>

                <Text
                  style={
                    styles.reviewsCount
                  }
                >
                  (
                  {home.reviewsCount ??
                    0}
                  )
                </Text>
              </View>
            </View>

            <View style={styles.availabilityRow}>
              <Text style={styles.available}>
                {t(
                  'profile:available',
                )}
              </Text>

              {home.pricePerNight !=
                null && (
                <Text
                  style={styles.price}
                >
                  ✈{' '}
                  {t(
                    'profile:price',
                  )}{' '}
                  {home.pricePerNight}€
                </Text>
              )}
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Users
                  size={20}
                  color="#222222"
                />

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {home.capacity ?? 1}
                </Text>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  {t(
                    'home:travelers',
                    'voyageurs',
                  )}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <BedDouble
                  size={20}
                  color="#222222"
                />

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {home.beds ?? 1}
                </Text>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  {t(
                    'profile:beds',
                  )}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Bath
                  size={20}
                  color="#222222"
                />

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {home.bathrooms ??
                    1}
                </Text>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  {t(
                    'home:bathrooms',
                    'salles de bain',
                  )}
                </Text>
              </View>
            </View>

            {home.description ? (
              <View style={styles.section}>
                <Text
                  style={styles.sectionTitle}
                >
                  {t(
                    'home:description',
                    'Description',
                  )}
                </Text>

                <Text
                  style={
                    styles.description
                  }
                >
                  {home.description}
                </Text>
              </View>
            ) : null}

            {home.amenities?.length >
            0 ? (
              <View style={styles.section}>
                <Text
                  style={styles.sectionTitle}
                >
                  {t(
                    'home:amenities',
                    'Équipements',
                  )}
                </Text>

                <View
                  style={
                    styles.amenities
                  }
                >
                  {home.amenities.map(
                    (
                      amenity: string,
                      index: number,
                    ) => (
                      <View
                        key={`${amenity}-${index}`}
                        style={
                          styles.amenity
                        }
                      >
                        <Text
                          style={
                            styles.amenityText
                          }
                        >
                          {amenity}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text
                style={styles.sectionTitle}
              >
                {t(
                  'home:location',
                  'Localisation',
                )}
              </Text>

              <View style={styles.mapPreview}>
                <MapPin
                  size={30}
                  color="#111111"
                />

                <Text
                  style={
                    styles.mapPreviewTitle
                  }
                >
                  {home.city}
                </Text>

                <Text
                  style={
                    styles.mapPreviewSubtitle
                  }
                >
                  {home.country}
                </Text>
              </View>
            </View>

            {home.owner ? (
              <View style={styles.section}>
                <Text
                  style={styles.sectionTitle}
                >
                  {t(
                    'home:host',
                    'Votre hôte',
                  )}
                </Text>

                <View style={styles.hostCard}>
                  <Image
                    source={{
                      uri:
                        home.owner
                          .avatarUrl ??
                        photos[0].url,
                    }}
                    style={
                      styles.hostAvatar
                    }
                  />

                  <View style={styles.hostInfo}>
                    <Text
                      style={
                        styles.hostName
                      }
                    >
                      {home.owner
                        .firstName ??
                        t(
                          'home:host',
                          'Hôte',
                        )}
                    </Text>

                    <Text
                      style={
                        styles.hostSubtitle
                      }
                    >
                      {home.city},{' '}
                      {home.country}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.swipeActionButton,
              styles.dislikeButton,
            ]}
            activeOpacity={0.85}
            onPress={handleDislike}
          >
            <X
              size={34}
              color="#E84B4B"
              strokeWidth={3}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.swipeActionButton,
              styles.likeButton,
            ]}
            activeOpacity={0.85}
            onPress={handleLike}
          >
            <Heart
              size={31}
              color="#31C978"
              fill="#31C978"
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 130,
  },

  carouselContainer: {
    width: SCREEN_WIDTH,
    height: 430,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },

  carouselImage: {
    width: SCREEN_WIDTH,
    height: 430,
    resizeMode: 'cover',
  },

  headerActions: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },

  pagination: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor:
      'rgba(255,255,255,0.6)',
  },

  paginationDotActive: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
  },

  photoCounter: {
    position: 'absolute',
    right: 14,
    bottom: 13,
    minWidth: 42,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 13,
    backgroundColor:
      'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: '900',
    color: '#111111',
  },

  locationRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  location: {
    fontSize: 14,
    color: '#656565',
  },

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
  },

  reviewsCount: {
    fontSize: 13,
    color: '#666666',
  },

  availabilityRow: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  available: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: '#41D086',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  price: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '900',
  },

  summary: {
    marginTop: 24,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '900',
    color: '#111111',
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#DDDDDD',
  },

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    marginBottom: 13,
    fontSize: 19,
    fontWeight: '900',
    color: '#111111',
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444444',
  },

  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  amenity: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF3A2',
  },

  amenityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3D2A00',
  },

  mapPreview: {
    height: 190,
    borderRadius: 18,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapPreviewTitle: {
    marginTop: 9,
    fontSize: 16,
    fontWeight: '900',
    color: '#111111',
  },

  mapPreviewSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#666666',
  },

  hostCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
  },

  hostAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E5E5E5',
  },

  hostInfo: {
    marginLeft: 13,
    flex: 1,
  },

  hostName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111111',
  },

  hostSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#666666',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E3E3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  swipeActionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  dislikeButton: {
    borderWidth: 2,
    borderColor: '#F4D2D2',
  },

  likeButton: {
    borderWidth: 2,
    borderColor: '#CDEEDC',
  },
});