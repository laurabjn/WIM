import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import {
  fetchNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  type NotificationItem,
} from '../infrastructure/notificationCenter.api';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    getParent?: () => {
      navigate: (screen: string, params?: Record<string, unknown>) => void;
    } | undefined;
  };
};

function formatQuand(valeur: string, t: (cle: string, options?: any) => string) {
  const minutes = Math.floor((Date.now() - Date.parse(valeur)) / 60000);

  if (minutes < 1) return t('notifications:now');
  if (minutes < 60) return t('notifications:minutes', { count: minutes });

  const heures = Math.floor(minutes / 60);

  if (heures < 24) return t('notifications:hours', { count: heures });

  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export const NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['notifications', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [curseur, setCurseur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);

  const charger = useCallback(async (suite?: string) => {
    try {
      const page = await fetchNotificationsApi(suite);

      setNotifications((actuelles) =>
        suite ? [...actuelles, ...page.notifications] : page.notifications,
      );
      setCurseur(page.curseurSuivant);
    } catch (error) {
      console.log('Load notifications error:', error);
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  // Ouvrir une notification vaut lecture : la marquer a la main serait une
  // corvee pour une information qu'on vient de consulter.
  async function ouvrir(notification: NotificationItem) {
    if (!notification.lu) {
      setNotifications((actuelles) =>
        actuelles.map((element) =>
          element.id === notification.id ? { ...element, lu: true } : element,
        ),
      );

      markNotificationReadApi(notification.id).catch(() => undefined);
    }

    const chatId = notification.data?.chatId as string | undefined;
    const exchangeId = (notification.data?.reviewExchangeId ??
      notification.data?.exchangeId) as string | undefined;

    if (chatId) {
      navigation.getParent?.()?.navigate('MessagesTab', {
        screen: 'Conversation',
        params: { chatId },
      });

      return;
    }

    if (exchangeId) {
      navigation.getParent?.()?.navigate('ExchangesTab');
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre}>{t('notifications:title')}</Text>

        <TouchableOpacity
          onPress={() =>
            markAllNotificationsReadApi()
              .then(() => charger())
              .catch(() => undefined)
          }
          hitSlop={10}
        >
          <Text style={styles.toutLire}>{t('notifications:readAll')}</Text>
        </TouchableOpacity>
      </View>

      {chargement ? (
        <ActivityIndicator style={styles.chargement} color={themeColors.text} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          refreshControl={
            <RefreshControl
              refreshing={rafraichit}
              onRefresh={() => {
                setRafraichit(true);
                charger();
              }}
              tintColor={themeColors.text}
            />
          }
          onEndReached={() => curseur && charger(curseur)}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Text style={styles.videTitre}>{t('notifications:empty')}</Text>
              <Text style={styles.videTexte}>
                {t('notifications:emptyHint')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.ligne, !item.lu && styles.ligneNonLue]}
              onPress={() => ouvrir(item)}
              activeOpacity={0.85}
            >
              <View
                style={[styles.pastille, item.lu && styles.pastilleLue]}
              />

              <View style={styles.contenu}>
                <Text style={styles.ligneTitre} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.ligneTexte} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>

              <Text style={styles.quand}>{formatQuand(item.createdAt, t)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const creerStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.screen },
    entete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 12,
    },
    rond: { width: 36, height: 36 },
    titre: { fontSize: 17, fontWeight: '700', color: c.text, flex: 1 },
    toutLire: { fontSize: 13, color: c.primary },
    chargement: { marginTop: 40 },
    liste: { padding: 12, gap: 8, paddingBottom: 120 },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
    },
    ligneNonLue: { backgroundColor: c.surfaceAlt },
    pastille: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.primary,
    },
    pastilleLue: { backgroundColor: 'transparent' },
    contenu: { flex: 1, gap: 2 },
    ligneTitre: { fontSize: 14, fontWeight: '700', color: c.text },
    ligneTexte: { fontSize: 13, color: c.textMuted, lineHeight: 18 },
    quand: { fontSize: 12, color: c.textFaint },
    vide: { alignItems: 'center', paddingVertical: 60, gap: 6 },
    videTitre: { fontSize: 15, fontWeight: '700', color: c.text },
    videTexte: { fontSize: 13, color: c.textMuted, textAlign: 'center' },
  });
