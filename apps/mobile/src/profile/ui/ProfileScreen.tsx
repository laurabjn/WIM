import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { UserHomeCard } from '../../home/ui/components/UserHomeCard';
import { ProfileMenuList } from './components/ProfileMenuList';
import { useMyProfile } from '../infrastructure/hook/useMyProfile';
import { useMyHomes } from '../../home/infrastructure/hooks/useMyHomes';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { clearSession, getSession } from 'src/auth/infrastructure/authStorage';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { unregisterPushToken } from 'src/notifications/pushRegistration';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'> & {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ProfileScreen: React.FC<Props> = ({ navigation, setIsAuthenticated, route }) => {
  const { t } = useTranslation('profile');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  
  const [token, setToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

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

  function confirmLogout() {
    Alert.alert(
      t('logOutTitle'),
      t('confirmLogOut'),
      [
        { text: t('logOutCancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
    );
  }

  async function handleLogout() {
    try {
      // Avant d'effacer la session : le retrait du jeton s'authentifie encore.
      await unregisterPushToken();

      await clearSession();

      setToken(null);

      setIsAuthenticated(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  }

  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
    reload: reloadProfile,
    setProfile
  } = useMyProfile(token);

  const {
    homes,
    isLoading: isHomesLoading,
    error: homesError,
    reloadHomes: reloadHomes,
  } = useMyHomes(token);

  const profileData = profile;
  const homesData = homes;

  useFocusEffect(
    useCallback(() => {
      if (token) {
        reloadProfile();
        reloadHomes();
      }
    }, [token, reloadProfile, reloadHomes])
  );

  useEffect(() => {
    if (route.params?.updatedProfile) {
      console.log(
        'PROFILE SCREEN RECEIVED UPDATED PROFILE:',
        JSON.stringify(route.params.updatedProfile, null, 2),
      );
      setProfile(route.params.updatedProfile);
    }
  }, [route.params?.updatedProfile, setProfile]);

  if (isSessionLoading || isProfileLoading) {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <ProfileHeaderCard
          profile={profile}
          onPressEdit={() => {
            console.log('Aller à Modifier profil');
            navigation.navigate('EditProfile', { profile });
          }}
        />

        <View style={styles.homesHeader}>
          <Text style={styles.sectionTitle}>{t('homes')}</Text>

          <TouchableOpacity
            style={styles.addHomeButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EditHome', {})}
          >
            <Text style={styles.addHomeText}>{t('addHome')}</Text>
          </TouchableOpacity>
        </View>

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
                  navigation.navigate('EditHome', { homeId });
                }}
                onPressCard={(homeId) => {
                  navigation.navigate('HomeDetails', { homeId });
                }}
              />
            ))}
          </View>
        )}

        <View style={styles.menuSection}>
          <ProfileMenuList
            onPressFavorites={() => navigation.navigate('Favorites')}
            onPressSettings={() => navigation.navigate('Settings', { profile })}
            onPressPreferences={() => navigation.navigate('Preferences', { profile })}
            onPressHelp={() => navigation.navigate('Help')}
            onPressLegal={() => console.log('Juridique')}
            onPressLogout={confirmLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },
  safeArea: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
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
    backgroundColor: c.surfaceAlt,
  },
  homesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addHomeButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.contrast,
  },
  addHomeText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
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
});