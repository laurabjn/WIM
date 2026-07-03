import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { publicUserHomesMock } from 'src/home/infrastructure/mocks/homeMocks';

export function MenuScreen() {
  const { t } = useTranslation(['search', 'common']);
    
  type CategoryFilter = 'ALL' | 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('NATURE');
  const [homes, setHomes] = useState<Home[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMocks, setUseMocks] = useState(true);

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

  const sourceHomes = useMocks ? publicUserHomesMock : homes;

  const filteredHomes = sourceHomes.filter(
    (home) => home.category === selectedCategory,
  );

  const featuredCity = sourceHomes[0]?.city;
  const featuredCountry = sourceHomes[0]?.country;

  const featuredHomes = featuredCity
    ? sourceHomes.filter((home) => home.city === featuredCity)
    : [];

  const featuredHome = featuredHomes[0];

  const heroTitle = featuredCity
    ? featuredCity.toUpperCase()
    : t('search:toExplore');
  
  const toggleSearch = () => {
    const nextValue = !quickSearch;

    setQuickSearch(nextValue);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.headerText,
              !quickSearch && styles.headerTextActive,
            ]}
          >
            {t('search:toExplore')}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.toggle}
            onPress={toggleSearch}
          >
            <View
              style={[
                styles.toggleCircle,
                quickSearch && styles.toggleCircleActive,
              ]}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerText,
              quickSearch && styles.headerTextActive,
            ]}
          >
            {t('search:fastSearch')}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Image
            source={{
              uri:
                featuredHome?.photos?.[0]?.url ??
                'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
            }}
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{heroTitle}</Text>

            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.smallLabel}>{t('search:nbExchanges')}</Text>
                <Text style={styles.exchangeCount}>{featuredHomes.length}</Text>
              </View>

              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonText}>{t('common:seeMore')}</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('search:categories')}</Text>

        <View style={styles.categories}>
          <Category
            icon={<Umbrella color="white" size={24} />}
            label="Nature"
            color="#37c878"
            onPress={() => setSelectedCategory('NATURE')}
          />
          <Category
            icon={<Waves color="white" size={24} />}
            label="Plage"
            color="#169bea"
            onPress={() => setSelectedCategory('BEACH')}
          />
          <Category
            icon={<Building2 color="white" size={24} />}
            label="Ville"
            color="#777"
            onPress={() => setSelectedCategory('CITY')}
          />
          <Category
            icon={<Landmark color="white" size={24} />}
            label="Culture"
            color="#f47b20"
            onPress={() => setSelectedCategory('CULTURE')}
          />
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
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toggle: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#b7f0dd',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  heroCard: {
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 36,
  },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  smallLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  exchangeCount: {
    color: '#fff',
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
    color: '#fff',
    fontWeight: '700',
  },
  arrow: {
    color: '#fff',
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  recentCard: {
    height: 95,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  recentImage: {
    width: 105,
    height: '100%',
  },
  recentContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  recentText: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  searchTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 3,
  },
  searchTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileIcon: {
    fontSize: 20,
  },
  headerTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});