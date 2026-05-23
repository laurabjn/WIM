import React from 'react';
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

export function ExchangesScreen({ navigation }: any) {
  const { t } = useTranslation("exchange");
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
    navigation.navigate('ExchangeDetails', {
      exchangeId: exchange.id,
    });
  }

  function goToMessages(exchange: Exchange) {
    navigation.navigate('Conversation', {
      exchangeId: exchange.id,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
    color: '#111111',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});