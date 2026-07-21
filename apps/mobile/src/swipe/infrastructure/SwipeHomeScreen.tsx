import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder
} from 'react-native';
import {
  Info,
  X,
  Check
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { swipeHomesMock } from './mocks/swipeHomeMocks';
import { SwipeHomeCard } from '../ui/components/SwipehomeCard';
import { useTranslation } from 'react-i18next';
import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  SwipeDirection,
  SwipeRecommendation,
  createSwipeApi,
  getSwipeRecommendationsApi
} from './swipe.api';
import { SearchToggle } from 'src/menu/ui/components/SearchToggle';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  currentUserMock,
  reciprocalLikesMock
} from './mocks/matchesMocks';
import { SwipeTopPreview } from '../ui/components/SwipeTopPreview';
import { SwipeMockRecommendationEngine } from './swipeRecommendationEngine';
import {
  RecommendationScenarioName,
  recommendationScenarios
} from './mocks/swipeRecommendationScenarioMock';

type Props = NativeStackScreenProps<SearchStackParamList, 'Swipe'>;

export function SwipeHomeScreen({ navigation }: Props) {
  const { t } = useTranslation(['common', "swipe"]);
  const position = useRef(new Animated.ValueXY()).current;

  const [index, setIndex] = useState(0);
  const [homes, setHomes] = useState<SwipeRecommendation[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState(true);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const engine = useMemo(
    () => new SwipeMockRecommendationEngine(),
    [],
  );

  const [scenario, setScenario] =
    useState<RecommendationScenarioName>(
      'SOUTH_WEST_FAMILY',
    );

  const recommendedHomes = useMemo(
    () =>
      engine.recommend(
        recommendationScenarios[scenario],
        swipeHomesMock,
        {
          limit: 30,
          excludeAlreadySwiped: true,
          includeDiscovery: true,
        },
      ),
    [engine, scenario],
  );

  const home = recommendedHomes[index];

  useEffect(() => {
    setIndex(0);
  }, [scenario]);

  // useEffect(() => {
  //   loadRecommendations();
  // }, []);

  async function loadRecommendations() {
    try {
      setSwipeLoading(true);
      setError(null);

      const session =
        await getSession();

      if (!session?.accessToken) {
        setError(
          'Utilisateur non connecté',
        );

        return;
      }

      const recommendations =
        await getSwipeRecommendationsApi(
          session.accessToken,
          20,
        );

      setHomes(recommendations);
      setIndex(0);
    } catch (loadError) {
      console.error(
        'Load recommendations error:',
        loadError,
      );

      setError(
        'Impossible de charger les logements',
      );
    } finally {
      setSwipeLoading(false);
    }
  }

  async function handleSwipe(direction: SwipeDirection) {
    if (!home || swipeLoading) return;

    setSwipeLoading(true);

    const swipe = {
      swiperId: currentUserMock.id,
      targetUserId: home.ownerId,
      homeId: home.id,
      direction,
      createdAt: new Date().toISOString(),
    };

    console.log('MOCK SWIPE:', swipe);

    if (direction === 'DISLIKE') {
      setSwipeLoading(false);
      next();
      return;
    }

    const isMatch = reciprocalLikesMock.includes(home.ownerId);

    if (isMatch) {
      const mockMatchId = `match-${currentUserMock.id}-${home.ownerId}`;

      setMatchId(mockMatchId);
      setShowMatch(true);
      setSwipeLoading(false);
      return;
    }

    setSwipeLoading(false);
    next();
  }

  // async function handleSwipe(direction: SwipeDirection) {
  //   if (!home || swipeLoading) return;

  //   try {
  //     setSwipeLoading(true);

  //     const session = await getSession();

  //     if (!session?.accessToken) {
  //       console.log('Utilisateur non connecté');
  //       return;
  //     }

  //     const result = await createSwipeApi(
  //       session.accessToken,
  //       home.ownerId,
  //       direction,
  //     );

  //     if (result.match) {
  //       setMatchId(result.matchId);
  //       setShowMatch(true);
  //       return;
  //     }

  //     next();
  //   } catch (error) {
  //     console.log('Swipe error:', error);
  //   } finally {
  //     setSwipeLoading(false);
  //   }
  // }

  function next() {
    setIndex((current) => current + 1);
  }

  if (!home) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>{t('swipe:noMoreHome')}</Text>
      </SafeAreaView>
    );
  }

  const toggleSearch = () => {
    const nextValue = !quickSearch;

    setQuickSearch(nextValue);

    if (nextValue) {
      navigation.navigate('Menu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toggleWrapper}>
        <SearchToggle
          quickSearch={true}
          onToggle={() => navigation.navigate('Menu')}
          exploreLabel={t('search:toExplore')}
          quickSearchLabel={t('search:fastSearch')}
        />
      </View>

      <View style={styles.debugButtons}>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() =>
            setScenario('SOUTH_WEST_FAMILY')
          }
        >
          <Text>Famille</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() =>
            setScenario('CITY_COUPLE')
          }
        >
          <Text>Ville</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() =>
            setScenario('NATURE_MOUNTAIN')
          }
        >
          <Text>Nature</Text>
        </TouchableOpacity>
      </View>

      <SwipeTopPreview
        home={home}
        onInfoPress={() => console.log('info')}
      />

    <View style={styles.debugScore}>
      <Text style={styles.debugTitle}>
        Score : {home.recommendationScore}
      </Text>

      <Text>
        Ville :
        {' '}
        {home.recommendationDetails.cityScore}
      </Text>

      <Text>
        Type :
        {' '}
        {home.recommendationDetails.homeTypeScore}
      </Text>

      <Text>
        Equipements :
        {' '}
        {home.recommendationDetails.amenitiesScore}
      </Text>

      <Text>
        Recherche :
        {' '}
        {home.recommendationDetails.searchScore}
      </Text>

      <Text>
        Pénalité :
        {' '}
        {home.recommendationDetails.dislikePenalty}
      </Text>
    </View>

      <SwipeHomeCard
        key={home.id}
        home={home}
        onLike={() => handleSwipe('LIKE')}
        onDislike={() => handleSwipe('DISLIKE')}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.roundButton}
          disabled={swipeLoading}
          onPress={() => handleSwipe('DISLIKE')}
        >
          <X size={28} color="#E74C3C" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Info size={16} color="#111" />
          <Text style={styles.moreText}>{t('common:seeMore')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roundButton}
          disabled={swipeLoading}
          onPress={() => handleSwipe('LIKE')}
        >
          <Check size={28} color="#2ECC71" />
        </TouchableOpacity>
      </View>

      {showMatch && (
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>C’est un match 🎉</Text>
            <Text style={styles.matchText}>
              Vous vous êtes likés mutuellement.
            </Text>

            <TouchableOpacity
              style={styles.matchButton}
              onPress={() => {
                setShowMatch(false);
                setMatchId(null);
                next();
              }}
            >
              <Text style={styles.matchButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  empty: {
    marginTop: 80,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
  },
  toggleWrapper: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  actions: {
    position: 'absolute',
    left: 30,
    right: 30,
    bottom: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  moreButton: {
    flex: 1,
    height: 50,
    marginHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  moreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  matchCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
  },
  matchText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#41D086',
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  debugScore: {
    position: 'absolute',
    top: 150,
    right: 12,
    zIndex: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  debugScoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  debugDetail: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
  debugButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  debugButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  debugTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  }
});