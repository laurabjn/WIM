import { Home } from '@wim/shared/home/home.type';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addFavoriteHome, getHomeById, removeFavoriteHome } from '../infrastructure/home.api';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { VehicleCard } from './components/details/VehiculeCard';
import { HomeHero } from './components/details/HomeHero';
import { HomeSummary } from './components/details/HomeSummary';
import { HomeDescription } from './components/details/HomeDescription';
import { HomeAmenities } from './components/details/HomeAmenities';
import { HostSummary } from './components/details/HostSummary';
import { HomeReviews } from './components/details/HomeReviews';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomesStackParamList } from 'src/navigation/type/homeStack';

type Props = NativeStackScreenProps<HomesStackParamList, 'HomeDetails'>;

export const HomeDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation(["home", "profile", "common"]);
  const { homeId } = route.params;
    
  const [home, setHome] = useState<Home | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
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
    async function loadHome() {
      if (isSessionLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        if (!token) {
          setError(t('common:unauthorized', 'Vous devez être connecté.'));
          return;
        }

        const data = await getHomeById(token, homeId);
        setHome(data);
      } catch {
        setError(t('home:loadError', 'Impossible de charger le logement.'));
      } finally {
        setIsLoading(false);
      }
    }

    loadHome();
  }, [homeId, token, isSessionLoading, t]);

  async function toggleFavorite(homeId: string) {
    if (!token || !home) return;

    const nextValue = !home.isFavorite;

    setHome({
      ...home,
      isFavorite: nextValue,
    });

    try {
      if (nextValue) {
        await addFavoriteHome(token, homeId);
      } else {
        await removeFavoriteHome(token, homeId);
      }
    } catch (error) {
      setHome({
        ...home,
        isFavorite: !nextValue,
      });

      console.log('Toggle favorite error:', error);
    }
  }
    
  if (error || !home) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>
          {error ?? t('home:notFound')}
        </Text>
      </SafeAreaView>
    );
  }
    
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHero
          home={home}
          onBack={() => navigation.goBack()}
          isFavorite={home.isFavorite ?? false}
          onToggleFavorite={toggleFavorite}
        />
        
        <HomeSummary home={home} />

        <View style={styles.content}>

          <Text style={styles.rating}>★ 4.2 · 23 commentaires</Text>

          <View style={styles.separator} />

          <HostSummary owner={home.owner} />

          <View style={styles.separator} />

        <HomeDescription description={home.description} />

          <View style={styles.carCard}>
            <View style={{ flex: 1 }}>
              {home.carExchangeAccepted ? (
                <VehicleCard vehicle={home.vehicle} />
              ) : null}
            </View>
          </View>

          <View style={styles.separator} />

          <HomeAmenities amenities={home.amenities ?? []} />

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Où se situe le logement</Text>

          <View style={styles.mapMock}>
            <Text style={styles.mapPin}>📍</Text>
          </View>

          <Text style={styles.locationTitle}>San Francisco, Etats-Unis</Text>

          <Text style={styles.description}>
            San Francisco est une ville emblématique de la côte ouest des
            États-Unis, connue pour son Golden Gate Bridge, ses rues en pente...
          </Text>

          <Text style={styles.readMore}>Lire la suite ›</Text>

          <View style={styles.separator} />

          <HomeReviews />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: {
    height: 300,
    position: 'relative',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },

  topActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },

  icon: {
    fontSize: 20,
    color: '#111111',
  },

  imageCounter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  content: {
    padding: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },

  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },

  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },

  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  hostText: {
    flex: 1,
  },

  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  hostSince: {
    fontSize: 12,
    color: '#6B7280',
  },

  hostRating: {
    alignItems: 'center',
  },

  star: {
    fontSize: 18,
    color: '#111111',
  },

  hostScore: {
    fontSize: 22,
    color: '#111111',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333333',
  },

  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginTop: 14,
  },

  contactButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#52D1A6',
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  carCard: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  featuresGrid: {
    gap: 14,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  featureIcon: {
    width: 28,
    fontSize: 20,
  },

  featureText: {
    fontSize: 15,
    color: '#111111',
  },

  outlineButton: {
    marginTop: 16,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
  },

  mapMock: {
    height: 240,
    borderRadius: 16,
    backgroundColor: '#DDEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  mapPin: {
    fontSize: 36,
  },

  locationTitle: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  readMore: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    textDecorationLine: 'underline',
  },

  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  reviewStars: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },

  reviewUser: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  errorText: {
    fontSize: 16,
    color: '#111111',
  },
});