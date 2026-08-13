import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { getMyMatchesApi, MatchItem } from '../infrastructure/matches.api';
import { BackButton } from 'src/shared/ui/BackButton';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export function MatchesScreen({ navigation }: Props) {
  const { t } = useTranslation('chat');

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const all = await getMyMatchesApi(session.accessToken);

      setMatches(all.filter((match) => !match.hasMessages));
    } catch (error) {
      console.log('Load matches error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={navigation.goBack} style={styles.backButton} />

        <Text style={styles.title}>{t('matches')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#087EBE" />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(match) => match.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cell}
              activeOpacity={0.8}
              disabled={!item.chatId}
              onPress={() =>
                navigation.navigate('Conversation', {
                  chatId: item.chatId,
                  participantId: item.user.id,
                  participantName: item.user.firstName ?? '',
                  participantAvatar: item.user.avatarUrl ?? null,
                })
              }
            >
              {item.user.avatarUrl ? (
                <Image
                  source={{ uri: item.user.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.initial}>
                    {(item.user.firstName ?? '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <Text style={styles.name} numberOfLines={1}>
                {item.user.firstName}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('empty')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    gap: 6,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },

  loader: {
    marginTop: 32,
  },

  grid: {
    paddingHorizontal: 12,
    paddingBottom: 120,
  },

  cell: {
    flex: 1 / 3,
    alignItems: 'center',
    paddingVertical: 12,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#F1F1F1',
  },

  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  initial: {
    fontSize: 26,
    fontWeight: '700',
    color: '#087EBE',
  },

  name: {
    marginTop: 6,
    fontSize: 12,
    color: '#111111',
  },

  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
