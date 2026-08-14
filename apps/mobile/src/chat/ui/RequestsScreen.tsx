import React, { useCallback, useState, useMemo } from 'react';
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
import {

  ArrowRight,
  Send,
  SlidersHorizontal,
  Zap,
} from 'lucide-react-native';
import type { MyRequestListItem } from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { getRequestsApi } from '../infrastructure/chat.api';
import { getMyMatchesApi } from '../infrastructure/matches.api';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export function RequestsScreen({ navigation }: Props) {
  const { t } = useTranslation('chat');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [requests, setRequests] = useState<MyRequestListItem[]>([]);
  const [onlyRelevant, setOnlyRelevant] = useState(false);
  const [newMatches, setNewMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const [items, matches] = await Promise.all([
        getRequestsApi(session.accessToken),
        getMyMatchesApi(session.accessToken),
      ]);

      setRequests(items);
      setNewMatches(matches.filter((match) => !match.hasMessages).length);
    } catch (error) {
      console.log('Load requests error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const bestScore = requests.reduce(
    (best, request) => Math.max(best, request.relevanceScore),
    0,
  );

  const visibleRequests = onlyRelevant
    ? requests.filter(
        (request) => request.relevanceScore >= Math.max(1, bestScore * 0.6),
      )
    : [...requests].sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={navigation.goBack} style={styles.circleButton} />

        <Text style={styles.headerTitle}>{t('requestsTitle')}</Text>

        <View style={styles.circleButton}>
          <SlidersHorizontal size={20} color={themeColors.text} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.matchesRow}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Matches')}
      >
        <View style={styles.matchesLeft}>
          <Zap size={18} color={themeColors.text} />
          <Text style={styles.matchesLabel}>{t('matches')}</Text>
        </View>

        <View style={styles.matchesRight}>
          <Text style={styles.matchesCount}>{newMatches}</Text>
          <ArrowRight size={18} color={themeColors.text} />
        </View>
      </TouchableOpacity>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, onlyRelevant && styles.filterPillActive]}
          activeOpacity={0.85}
          onPress={() => setOnlyRelevant((current) => !current)}
        >
          <Text
            style={[
              styles.filterLabel,
              onlyRelevant && styles.filterLabelActive,
            ]}
          >
            {onlyRelevant ? t('allRequests') : t('relevantRequests')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#087EBE" />
      ) : (
        <FlatList
          data={visibleRequests}
          keyExtractor={(chat) => chat.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('Conversation', {
                  chatId: item.id,
                  participantId: item.participant?.id,
                  participantName: item.participant?.firstName ?? '',
                  participantAvatar: item.participant?.avatarUrl ?? null,
                })
              }
            >
              {item.participant?.avatarUrl ? (
                <Image
                  source={{ uri: item.participant.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {(item.participant?.firstName ?? '?')
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.rowContent}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.participant?.firstName} {item.participant?.lastName}
                </Text>

                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage?.content ?? ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Send size={34} color={themeColors.text} />
              </View>

              <Text style={styles.emptyTitle}>{t('emptyRequestsTitle')}</Text>
              <Text style={styles.emptyText}>{t('emptyRequestsHint')}</Text>
            </View>
          }
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },

  matchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  matchesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  matchesLabel: {
    fontSize: 15,
    color: c.textMuted,
  },

  matchesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  matchesCount: {
    fontSize: 15,
    color: c.textMuted,
  },

  filterRow: {
    alignItems: 'center',
    paddingBottom: 14,
  },

  filterPill: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },

  filterPillActive: {
    borderColor: c.accent,
    backgroundColor: c.accent,
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },

  filterLabelActive: {
    color: c.onContrast,
  },

  loader: {
    marginTop: 40,
  },

  list: {
    flexGrow: 1,
    paddingBottom: 120,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: c.surfaceAlt,
  },

  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: c.primary,
  },

  rowContent: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },

  preview: {
    marginTop: 3,
    fontSize: 13,
    color: c.textMuted,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
    paddingBottom: 60,
  },

  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: c.contrast,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: c.text,
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: c.textMuted,
    textAlign: 'center',
  },
});
