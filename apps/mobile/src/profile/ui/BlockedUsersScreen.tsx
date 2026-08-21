import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  getBlockedUsersApi,
  unblockUserApi,
  type BlockedUser,
} from 'src/chat/infrastructure/moderation.api';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  navigation: { goBack: () => void };
};

export function BlockedUsersScreen({ navigation }: Props) {
  const { t } = useTranslation('profile');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [bloques, setBloques] = useState<BlockedUser[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      setBloques(await getBlockedUsersApi(session.accessToken));
    } catch (error) {
      console.log('Load blocked users error:', error);
    } finally {
      setChargement(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function debloquer(utilisateur: BlockedUser) {
    setEnCours(utilisateur.id);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await unblockUserApi(session.accessToken, utilisateur.id);

      setBloques((actuels) =>
        actuels.filter((membre) => membre.id !== utilisateur.id),
      );
    } catch (error) {
      console.log('Unblock error:', error);
      Alert.alert('', t('blocked.error'));
    } finally {
      setEnCours(null);
    }
  }

  function confirmer(utilisateur: BlockedUser) {
    Alert.alert(
      t('blocked.confirmTitle'),
      t('blocked.confirmMessage', {
        name: `${utilisateur.firstName} ${utilisateur.lastName}`.trim(),
      }),
      [
        { text: t('blocked.cancel'), style: 'cancel' },
        { text: t('blocked.unblock'), onPress: () => debloquer(utilisateur) },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={navigation.goBack} style={styles.headerButton} />

        <Text style={styles.title}>{t('blocked.title')}</Text>

        <View style={styles.headerButton} />
      </View>

      {chargement ? (
        <ActivityIndicator style={styles.loader} color={themeColors.primary} />
      ) : (
        <FlatList
          data={bloques}
          keyExtractor={(membre) => membre.id}
          contentContainerStyle={styles.liste}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Text style={styles.videTitre}>{t('blocked.emptyTitle')}</Text>
              <Text style={styles.videTexte}>{t('blocked.emptyText')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.ligne}>
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarVide]}>
                  <Text style={styles.initiale}>
                    {(item.firstName || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <Text style={styles.nom} numberOfLines={1}>
                {item.firstName} {item.lastName}
              </Text>

              <TouchableOpacity
                style={styles.bouton}
                activeOpacity={0.8}
                disabled={enCours === item.id}
                onPress={() => confirmer(item)}
              >
                {enCours === item.id ? (
                  <ActivityIndicator
                    size="small"
                    color={themeColors.onContrast}
                  />
                ) : (
                  <Text style={styles.boutonTexte}>{t('blocked.unblock')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    headerButton: {
      width: 44,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
    },
    loader: {
      marginTop: 40,
    },
    liste: {
      paddingHorizontal: 16,
      paddingTop: 8,
      flexGrow: 1,
    },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: c.surfaceAlt,
    },
    avatarVide: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    initiale: {
      fontSize: 17,
      fontWeight: '700',
      color: c.textMuted,
    },
    nom: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    bouton: {
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.contrast,
    },
    boutonTexte: {
      fontSize: 13,
      fontWeight: '700',
      color: c.onContrast,
    },
    vide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    videTitre: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    videTexte: {
      marginTop: 6,
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
    },
  });
