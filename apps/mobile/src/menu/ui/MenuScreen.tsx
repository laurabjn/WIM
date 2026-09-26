import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Umbrella,
    Waves,
    Building2,
    Landmark
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category } from './components/Category';
import { RecentSearch } from './components/RecentSearch';
import { useTranslation } from 'react-i18next';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { Home } from '@wim/shared/home/home.type';
import { searchHomesApi } from 'src/home/infrastructure/searchHome.api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { SearchToggle } from './components/SearchToggle';
import { getCityImagesApi } from 'src/utils/cityImages';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<SearchStackParamList,'Menu'>;

export function MenuScreen({ navigation }: Props) {
  const { t } = useTranslation(['search', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
    
  type CategoryFilter = 'ALL' | 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';

  const [homes, setHomes] = useState<Home[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => () => setQuickSearch(false), []),
  );

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
    if (quickSearch) {
      console.log('Quick search activated');
    }
  }, [quickSearch]);

  useEffect(() => {
    async function loadExploreHomes() {
      if (isSessionLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        if (!token) {
          setError('Vous devez être connecté.');
          return;
        }

        const data = await searchHomesApi(token, {});
        setHomes(data);
      } catch {
        setError('Impossible de charger les logements.');
      } finally {
        setIsLoading(false);
      }
    }

    loadExploreHomes();
  }, [token, isSessionLoading]);

  const sourceHomes = homes;

  const openCategory = (category: Exclude<CategoryFilter, 'ALL'>) =>
    navigation.navigate('SearchResults', {
      city: '',
      category,
      capacity: undefined,
    });

  const featuredCity = sourceHomes[0]?.city;
  const featuredCountry = sourceHomes[0]?.country;

  const featuredHomes = featuredCity
    ? sourceHomes.filter((home) => home.city === featuredCity)
    : [];

  const [affiche, setAffiche] = useState<string | null>(null);

  useEffect(() => {
    let abandonne = false;

    if (!featuredCity) {
      setAffiche(null);
      return;
    }

    getCityImagesApi(featuredCity, featuredCountry ?? '', 1)
      .then((images) => {
        if (!abandonne) setAffiche(images[0]?.grande ?? null);
      })
      .catch(() => {
        if (!abandonne) setAffiche(null);
      });

    return () => {
      abandonne = true;
    };
  }, [featuredCity, featuredCountry]);

  const heroTitle = featuredCity
    ? featuredCity.toUpperCase()
    : t('search:toExplore');
  
  const toggleSearch = () => {
    setQuickSearch(true);

    setTimeout(() => navigation.navigate('Swipe'), 260);
  };
    
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SearchToggle
          quickSearch={quickSearch}
          onToggle={toggleSearch}
          exploreLabel={t('search:toExplore')}
          quickSearchLabel={t('search:fastSearch')}
        />

        <View style={styles.heroCard}>
          {affiche ? (
            <Image source={{ uri: affiche }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroImageVide]} />
          )}

          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.35, 0.6, 1]}
            style={styles.heroOverlay}
          >
            <Text style={styles.heroTitle}>{heroTitle}</Text>

            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.smallLabel}>{t('search:nbExchanges')}</Text>
                <Text style={styles.exchangeCount}>{featuredHomes.length}</Text>
              </View>

              <TouchableOpacity
                style={styles.heroButton}
                activeOpacity={0.85}
                disabled={!featuredCity}
                onPress={() =>
                  navigation.navigate('SearchResults', {
                    city: featuredCity ?? '',
                    capacity: undefined,
                  })
                }
              >
                <Text style={styles.heroButtonText}>{t('common:seeMore')}</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.blocCategories}>
          <Text style={styles.sectionTitle}>{t('search:categories')}</Text>

          <View style={styles.categories}>
          <Category
            icon={<Umbrella color="white" size={24} />}
            label="Nature"
            color="#37c878"
            onPress={() => openCategory('NATURE')}
          />
          <Category
            icon={<Waves color="white" size={24} />}
            label="Plage"
            color="#169bea"
            onPress={() => openCategory('BEACH')}
          />
          <Category
            icon={<Building2 color="white" size={24} />}
            label="Ville"
            color="#777"
            onPress={() => openCategory('CITY')}
          />
          <Category
            icon={<Landmark color="white" size={24} />}
            label="Culture"
            color="#f47b20"
            onPress={() => openCategory('CULTURE')}
          />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('search:lastSearches')}</Text>

        {isLoading && <ActivityIndicator />}

        {/* {error && <Text>{error}</Text>} */}

        {sourceHomes.slice(0, 2).map((home) => (
          <RecentSearch
            key={home.id}
            image={home.photos?.[0]?.url}
            title={`${home.city}, ${home.country}`}
            dates="Dates disponibles"
            travelers={`${home.capacity} voyageurs`}
            onPress={() =>
              navigation.navigate('HomeDetails', { homeId: home.id })
            }
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
  content: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 84,
  },
  heroCard: {
    flex: 1,
    minHeight: 180,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageVide: {
    backgroundColor: c.surfaceAlt,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 14,
    justifyContent: 'space-between',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Oswald_700Bold',
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: 1,
  },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  smallLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  exchangeCount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
  },
  heroButton: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  sectionTitle: {
    color: c.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  blocCategories: {
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 14,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});