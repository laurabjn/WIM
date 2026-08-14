import React, { useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { UserHomeCard } from '../../home/ui/components/UserHomeCard';
import { ProfileMenuList } from './components/ProfileMenuList';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { usePublicProfile } from '../infrastructure/hook/usePublicProfile';
import { UserProfile } from '@wim/shared';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { listHomesByOwner } from 'src/home/infrastructure/home.api';
import { Home } from '@wim/shared/home/home.type';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PublicProfile'> 

export const ProfilePublicScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation('profile'); 
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const { userId } = route.params;
  const [token, setToken] = useState<string | null>(null);

  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = usePublicProfile(userId, token);

  const [homes, setHomes] = useState<Home[]>([]);
  const [isHomesLoading, setIsHomesLoading] = useState(true);
  const [homesError, setHomesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const session = await getSession();

      if (cancelled) return;

      if (!session?.accessToken) {
        setIsHomesLoading(false);
        return;
      }

      setToken(session.accessToken);

      try {
        const data = await listHomesByOwner(session.accessToken, userId);

        if (!cancelled) setHomes(data);
      } catch (error) {
        if (!cancelled) setHomesError(t('loadHomesError'));
      } finally {
        if (!cancelled) setIsHomesLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, t]);

  if (isProfileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>{t('loading')}</Text>
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View style={styles.centered}>
        <Text>{profileError ?? t('profileNotFound')}</Text>
      </View>
    );
  }

  const normalizedProfile: UserProfile = {
    id: profile.id ?? userId,
    email: profile.email ?? '',
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    age: profile.age ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    bio: profile.bio ?? null,
    country: profile.country ?? null,
    nationality: profile.nationality ?? null,
    phone: profile.phone ?? null,
    birthDate: profile.birthDate ?? null,
    languages: profile.languages ?? [],
    preferredLocale: profile.preferredLocale ?? 'fr',
    travelPreferences: profile.travelPreferences ?? {
        preferredCountries: [],
        preferredHomeTypes: [],
        minCapacity: null,
        maxCapacity: null,
        carExchangeAccepted: null,
        flexibleDates: null,
    },
    averageRating: profile.averageRating ?? null,
    reviewsCount: profile.reviewsCount ?? 0,
    homesCount: profile.homesCount ?? 0,
    exchangesCount: profile.exchangesCount ?? 0,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <ProfileHeaderCard
          profile={normalizedProfile}
          onPressEdit={() => {}}
          hideEditButton
        />

        <Text style={styles.sectionTitle}>{t('homes')}</Text>

        {isHomesLoading ? (
          <ActivityIndicator />
        ) : homesError ? (
          <Text>{homesError}</Text>
        ) : homes.length === 0 ? (
          <Text style={styles.emptyText}>{t('noHomes')}</Text>
        ) : (
          <View style={styles.homesList}>
            {homes.map((home) => (
              <UserHomeCard
                key={home.id}
                home={home}
                onPressEdit={(homeId) => {
                  console.log('Modifier logement', homeId);
                }}
                onPressCard={(homeId) =>
                  navigation.navigate('HomeDetails', { homeId })
                }
                hideEditButton
              />
            ))}
          </View>
        )}

        <View style={styles.reportCard}>
          <Text style={styles.reportText}>⚠ {t('report')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F7F7F7',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  homesList: {
    gap: 14,
  },
  menuSection: {
    marginTop: 18,
  },
  emptyText: {
    fontSize: 13,
    color: c.textMuted,
  },
  reportCard: {
    marginTop: 16,
    backgroundColor: c.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  reportText: {
    fontSize: 14,
    color: c.text,
    fontWeight: '500',
  },
});