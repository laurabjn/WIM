import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { FavoriteHomeCard } from './components/FavoriteHomeCard';
import { addFavoriteHome, listFavoriteHomes, removeFavoriteHome } from '../infrastructure/home.api';
import { Home } from '@wim/shared/home/home.type';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { t } = useTranslation('profile');

  const [homes, setHomes] = useState<Home[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isLoadingHomes, setIsLoadingHomes] = useState(true);

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
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('favorites.title', 'Logements favoris')}
        </Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => console.log('Filtres')}
        >
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
      </View>

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
          homes.map((home) => (
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
});