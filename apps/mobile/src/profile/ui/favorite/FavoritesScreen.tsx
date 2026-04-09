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
import { useFavoriteHomes } from 'src/profile/infrastructure/hook/useFavoriteHome';
import { FavoriteHomeCard } from './component/FavoriteHomeCard';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { t } = useTranslation('profile');
  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getSession();
        setToken(session?.accessToken ?? null);
      } catch (error) {
        console.log('Error loading session:', error);
        setToken(null);
      } finally {
        setIsSessionLoading(false);
      }
    }

    loadSession();
  }, []);

  const {
    favorites,
    isLoading,
    error,
  } = useFavoriteHomes(token);

  if (isSessionLoading || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>{t('favorites.loading', 'Chargement des favoris...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
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
        {favorites.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>
              {t('favorites.empty', 'Aucun logement favori pour le moment')}
            </Text>
          </View>
        ) : (
          favorites.map((home) => (
            <FavoriteHomeCard
              key={home.id}
              home={home}
              onPress={(homeId) => {
                console.log('Open favorite home:', homeId);
              }}
              onPressFavorite={(homeId) => {
                console.log('Remove favorite:', homeId);
              }}
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