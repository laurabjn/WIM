import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Exchange } from '@wim/shared';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { useMyExchanges } from '../infrastructure/hooks/useMyExchanges';
import { ExchangeSection } from './components/exchange/ExchangeSection';
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

  function goToDetails(exchange: Exchange) {
    navigation.navigate('HomeDetails', { homeId: exchange.homeId });
  }

  function goToMessages(exchange: Exchange) {
    if (!exchange.chatId) return;

    // La conversation vit dans l'onglet Messages : depuis la pile des
    // echanges, il faut passer par le navigateur parent.
    const parent = navigation.getParent?.();

    if (parent) {
      parent.navigate('MessagesTab', {
        screen: 'Conversation',
        params: {
          chatId: exchange.chatId,
          participantId: exchange.partner?.id,
          participantName: exchange.partner?.firstName ?? '',
          participantAvatar: exchange.partner?.avatarUrl ?? null,
        },
      });

      return;
    }

    navigation.navigate('Conversation', { chatId: exchange.chatId });
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