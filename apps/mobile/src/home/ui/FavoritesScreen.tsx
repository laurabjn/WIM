import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { FavoriteHomeCard } from './components/FavoriteHomeCard';
import { addFavoriteHome, listFavoriteHomes, removeFavoriteHome } from '../infrastructure/home.api';
import { Home } from '@wim/shared/home/home.type';
import { BackButton } from 'src/shared/ui/BackButton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { t } = useTranslation('profile');

  const [homes, setHomes] = useState<Home[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isLoadingHomes, setIsLoadingHomes] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HOUSE' | 'APARTMENT' | 'CAR_EXCHANGE'>('ALL');

  useEffect(() => {
    async function loadFavorites() {
      try {
        const session = await getSession();
        const accessToken = session?.accessToken ?? null;

        setToken(accessToken);

        if (!accessToken) return;

        const favoriteHomes = await listFavoriteHomes(accessToken);
        setHomes(favoriteHomes.map((home) => ({ ...home, isFavorite: true })));
      } catch (error) {
        console.log('Error loading favorites:', error);
      } finally {
        setIsSessionLoading(false);
        setIsLoadingHomes(false);
      }
    }

    loadFavorites();
  }, []);

  async function toggleFavorite(homeId: string) {
    if (!token) return;

    const currentHome = homes.find((home) => home.id === homeId);
    if (!currentHome) return;

    const nextIsFavorite = !currentHome.isFavorite;

    setHomes((prev) =>
      prev.map((home) =>
        home.id === homeId
          ? { ...home, isFavorite: nextIsFavorite }
          : home,
      ),
    );

    try {
      if (nextIsFavorite) {
        await addFavoriteHome(token, homeId);
      } else {
        await removeFavoriteHome(token, homeId);
      }
    } catch (error) {
      setHomes((prev) =>
        prev.map((home) =>
          home.id === homeId
            ? { ...home, isFavorite: !nextIsFavorite }
            : home,
        ),
      );

      console.log('Toggle favorite error:', error);
    }
  }

  const filteredHomes = useMemo(() => {
    switch (selectedFilter) {
      case 'HOUSE':
        return homes.filter((home) => home.homeType?.toLowerCase() === 'house');

      case 'APARTMENT':
        return homes.filter((home) => home.homeType?.toLowerCase() === 'apartment');

      case 'CAR_EXCHANGE':
        return homes.filter((home) => home.carExchangeAccepted);

      default:
        return homes;
    }
  }, [homes, selectedFilter]);

  if (isSessionLoading || isLoadingHomes) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>{t('favorites.loading', 'Chargement des favoris...')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} style={styles.headerIconButton} />

        <Text style={styles.headerTitle}>
          {t('favorites.title', 'Logements favoris')}
        </Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => setIsFilterOpen((current) => !current)}
        >
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {isFilterOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSelectedFilter('ALL');
              setIsFilterOpen(false);
            }}
          >
            <Text style={styles.dropdownText}>Tous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSelectedFilter('HOUSE');
              setIsFilterOpen(false);
            }}
          >
            <Text style={styles.dropdownText}>Maison</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSelectedFilter('APARTMENT');
              setIsFilterOpen(false);
            }}
          >
            <Text style={styles.dropdownText}>Appartement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSelectedFilter('CAR_EXCHANGE');
              setIsFilterOpen(false);
            }}
          >
            <Text style={styles.dropdownText}>Échange voiture</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {homes.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>
              {t('favorites.empty', 'Aucun logement favori pour le moment')}
            </Text>
          </View>
        ) : (
          filteredHomes.map((home) => (
            <FavoriteHomeCard
              key={home.id}
              home={home}
              onPress={(homeId) => {
                navigation.navigate('HomeDetails', { homeId });
              }}
              onPressFavorite={toggleFavorite}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    paddingHorizontal: 12,
    paddingBottom: 120,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: '#F4F4F4',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
    color: '#1F1F1F',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  emptyWrapper: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  dropdown: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
});