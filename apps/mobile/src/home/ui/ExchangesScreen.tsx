import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Exchange } from '@wim/shared';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { useMyExchanges } from '../infrastructure/hooks/useMyExchanges';
import { ExchangeSection } from './components/exchange/ExchangeSection';
import {
  getStaysToReviewApi,
  type StayToReview,
} from 'src/chat/infrastructure/exchange.api';
import { resolveImageUrl } from '../infrastructure/home.api';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

export function ExchangesScreen({ navigation }: any) {
  const { t } = useTranslation("exchange");
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    getSession().then((session) => {
      setToken(session?.accessToken ?? null);
    });
  }, []);

  const {
    currentExchanges,
    futureExchanges,
    pastExchanges,
    loading,
    error,
    refresh,
  } = useMyExchanges(token);

  const [staysToReview, setStaysToReview] = useState<StayToReview[]>([]);

  const chargerSejoursANoter = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      setStaysToReview(await getStaysToReviewApi(session.accessToken));
    } catch (loadError) {
      console.log('Load stays to review error:', loadError);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      chargerSejoursANoter();
    }, [chargerSejoursANoter]),
  );

  function goToReview(sejour: StayToReview) {
    navigation.navigate('ReviewStay', {
      exchangeId: sejour.exchangeId,
      homeTitle: sejour.homeTitle,
      homePhotoUrl: sejour.homePhotoUrl,
      partnerFirstName: sejour.partnerFirstName,
    });
  }

  function goToDetails(exchange: Exchange) {
    navigation.navigate('HomeDetails', { homeId: exchange.homeId });
  }

  function goToMessages(exchange: Exchange) {
    if (!exchange.chatId) return;

    // La conversation s'ouvre dans la pile des echanges : sauter dans l'onglet
    // Messages faisait revenir ailleurs, le retour d'onglet ramenant au premier.
    navigation.navigate('Conversation', {
      chatId: exchange.chatId,
      participantId: exchange.partner?.id,
      participantName: exchange.partner?.firstName ?? '',
      participantAvatar: exchange.partner?.avatarUrl ?? null,
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {staysToReview.length > 0 ? (
          <View style={styles.rappelBloc}>
            <Text style={styles.rappelTitre}>{t('review.pendingTitle')}</Text>

            <Text style={styles.rappelTexte}>{t('review.pendingText')}</Text>

            {staysToReview.map((sejour) => (
              <TouchableOpacity
                key={sejour.exchangeId}
                style={styles.rappelCarte}
                activeOpacity={0.85}
                onPress={() => goToReview(sejour)}
              >
                {sejour.homePhotoUrl ? (
                  <Image
                    source={{ uri: resolveImageUrl(sejour.homePhotoUrl) ?? '' }}
                    style={styles.rappelPhoto}
                  />
                ) : (
                  <View style={[styles.rappelPhoto, styles.rappelPhotoVide]} />
                )}

                <View style={styles.rappelTexteBloc}>
                  <Text style={styles.rappelLogement} numberOfLines={1}>
                    {sejour.homeTitle}
                  </Text>

                  <Text style={styles.rappelAction}>
                    {t('review.rateNow')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <ExchangeSection
          title={t("currentExchanges")}
          exchanges={currentExchanges}
          onPressDetails={goToDetails}
          onPressMessages={goToMessages}
        />

        <ExchangeSection
          title={t("upcomingExchanges")}
          exchanges={futureExchanges}
          onPressDetails={goToDetails}
          onPressMessages={goToMessages}
        />

        <ExchangeSection
          title={t("pastExchanges")}
          exchanges={pastExchanges}
          onPressDetails={goToDetails}
          onPressMessages={goToMessages}
        />

        {currentExchanges.length === 0 &&
          futureExchanges.length === 0 &&
          pastExchanges.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t("noExchanges")}</Text>
              <Text style={styles.emptyText}>
                {t("noExchangesDescription")}
              </Text>
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  rappelBloc: {
    marginBottom: 22,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.warning,
    backgroundColor: c.surface,
  },
  rappelTitre: {
    fontSize: 15,
    fontWeight: '800',
    color: c.text,
  },
  rappelTexte: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: c.textMuted,
  },
  rappelCarte: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rappelPhoto: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: c.surfaceAlt,
  },
  rappelPhotoVide: {
    backgroundColor: c.border,
  },
  rappelTexteBloc: {
    flex: 1,
  },
  rappelLogement: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
  rappelAction: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: c.primary,
  },
  container: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  error: {
    color: '#D33',
    fontSize: 14,
    textAlign: 'center',
  },
  empty: {
    marginTop: 120,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: c.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: c.textMuted,
    textAlign: 'center',
  },
});