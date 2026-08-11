import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Info,
  X,
  Check
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { SwipeHomeCard } from '../ui/components/SwipehomeCard';
import { useTranslation } from 'react-i18next';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { SearchToggle } from 'src/menu/ui/components/SearchToggle';
import {
  createSwipeApi,
  getSwipeRecommendationsApi,
  SwipeDirection,
  SwipeRecommendation,
} from '../infrastructure/swipe.api';
import { resolveImageUrl } from 'src/home/infrastructure/home.api';
import { SwipeTopPreview } from './components/SwipeTopPreview';

type Props = NativeStackScreenProps<SearchStackParamList, 'Swipe'>;

function withResolvedPhotos(
  home: SwipeRecommendation,
): SwipeRecommendation {
  return {
    ...home,
    photos: (home.photos ?? []).map((photo) => ({
      ...photo,
      url: resolveImageUrl(photo.url) ?? photo.url,
    })),
    owner: home.owner
      ? {
          ...home.owner,
          avatarUrl: resolveImageUrl(home.owner.avatarUrl),
        }
      : home.owner,
  };
}

export function SwipeHomeScreen({ navigation, route }: Props) {
  const { t } = useTranslation(['common', 'swipe']);
  const position = useRef(new Animated.ValueXY()).current;

  const [index, setIndex] = useState(0);
  const [homes, setHomes] = useState<SwipeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState(true);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const home = homes[index];

  const loadRecommendations = useCallback(async () => {
    try {
      setError(null);

      const session = await getSession();

      if (!session?.accessToken) {
        setError(t('swipe:notSignedIn'));
        return;
      }

      const recommendations = await getSwipeRecommendationsApi(
        session.accessToken,
        20,
      );

      setHomes(recommendations.map(withResolvedPhotos));
      setIndex(0);
    } catch (loadError) {
      console.log('Load recommendations error:', loadError);
      setError(t('swipe:loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      // Une seule fois : revenir du detail d'un logement ne doit pas rebattre
      // les cartes ni ramener l'utilisateur au debut de la pile.
      if (homes.length === 0) loadRecommendations();
    }, [homes.length, loadRecommendations]),
  );

  async function handleSwipe(direction: SwipeDirection) {
    if (!home || swipeLoading) return;

    setSwipeLoading(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) {
        setError(t('swipe:notSignedIn'));
        return;
      }

      const result = await createSwipeApi(
        session.accessToken,
        home.ownerId,
        home.id,
        direction,
      );

      if (result.match) {
        setMatchedName(home.owner?.firstName ?? '');
        setMatchedUserId(home.ownerId);
        setChatId(result.chatId ?? null);
        return;
      }

      next();
    } catch (swipeError) {
      console.log('Swipe error:', swipeError);
      setError(t('swipe:swipeError'));
    } finally {
      setSwipeLoading(false);
    }
  }

  function next() {
    setIndex((current) => current + 1);
  }

  function closeMatch() {
    setMatchedName(null);
    setMatchedUserId(null);
    setChatId(null);
    next();
  }

  function openMatchedChat() {
    const targetChatId = chatId;
    const targetUserId = matchedUserId;
    const name = matchedName;

    closeMatch();

    if (!targetChatId) return;

    // La conversation vit dans l'onglet Messages : il faut passer par le
    // navigateur parent, elle est hors de la pile de recherche.
    navigation.getParent()?.navigate('MessagesTab', {
      screen: 'Conversation',
      params: {
        chatId: targetChatId,
        participantId: targetUserId,
        participantName: name ?? '',
        participantAvatar: null,
      },
    });
  }

  const toggleSearch = () => {
    const nextValue = !quickSearch;

    setQuickSearch(nextValue);

    if (nextValue) {
      navigation.navigate('Menu');
    }
  };

  function openHomeDetails() {
    navigation.navigate('SwipeHomeDetails', {
      homeId: home.id,
      swipeIndex: index,
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color="#087EBE" />
      </SafeAreaView>
    );
  }

  if (!home) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>
          {error ?? t('swipe:noMoreHome')}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          onPress={() => {
            setLoading(true);
            loadRecommendations();
          }}
        >
          <Text style={styles.retryText}>{t('common:retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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

      <SwipeTopPreview
        home={home}
        onInfoPress={openHomeDetails}
      />

      <SwipeHomeCard
        key={home.id}
        home={home}
        onPress={openHomeDetails}
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

        <TouchableOpacity style={styles.moreButton} onPress={openHomeDetails}>
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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {matchedName !== null && (
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>{t('swipe:match')}</Text>
            <Text style={styles.matchText}>
              {t('swipe:matchText', { firstName: matchedName })}
            </Text>

            {chatId ? (
              <TouchableOpacity
                style={styles.matchButton}
                onPress={openMatchedChat}
              >
                <Text style={styles.matchButtonText}>
                  {t('swipe:openConversation')}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.matchSecondary}
              onPress={closeMatch}
            >
              <Text style={styles.matchSecondaryText}>
                {t('common:continue')}
              </Text>
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
  loader: {
    marginTop: 90,
  },
  empty: {
    marginTop: 80,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
    paddingHorizontal: 40,
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  error: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 115,
    textAlign: 'center',
    fontSize: 12,
    color: '#DC2626',
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
  matchSecondary: {
    marginTop: 12,
    paddingVertical: 8,
  },
  matchSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
});
