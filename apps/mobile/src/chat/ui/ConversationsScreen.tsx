import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import type { MyChatListItem } from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { getChatsApi } from '../infrastructure/chat.api';
import { formatRelativeDate } from '../utils/formatRelativeDate';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export function ConversationsScreen({ navigation }: Props) {
  const { t } = useTranslation('chat');

  const [chats, setChats] = useState<MyChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setError(null);

      const session = await getSession();

      if (!session?.accessToken) {
        setChats([]);
        return;
      }

      setChats(await getChatsApi(session.accessToken));
    } catch (loadError) {
      console.log('Load chats error:', loadError);
      setError(t('loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats]),
  );

  function handleRefresh() {
    setRefreshing(true);
    loadChats();
  }

  function renderChat(chat: MyChatListItem) {
    const participant = chat.participant;
    const hasUnread = chat.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('Conversation', {
            chatId: chat.id,
            participantName: participant?.firstName ?? '',
            participantAvatar: participant?.avatarUrl ?? null,
          })
        }
      >
        {participant?.avatarUrl ? (
          <Image source={{ uri: participant.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {(participant?.firstName ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Text
              style={[styles.name, hasUnread && styles.nameUnread]}
              numberOfLines={1}
            >
              {participant?.firstName} {participant?.lastName}
            </Text>

            {chat.lastMessage ? (
              <Text style={styles.date}>
                {formatRelativeDate(chat.lastMessage.createdAt, t)}
              </Text>
            ) : null}
          </View>

          <View style={styles.rowFooter}>
            <Text
              style={[styles.preview, hasUnread && styles.previewUnread]}
              numberOfLines={1}
            >
              {chat.lastMessage?.content ?? t('startConversation')}
            </Text>

            {hasUnread ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{chat.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>{t('title')}</Text>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#087EBE" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(chat) => chat.id}
          renderItem={({ item }) => renderChat(item)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {error ?? t('empty')}
              </Text>

              {error ? null : (
                <Text style={styles.emptyText}>{t('emptyDescription')}</Text>
              )}
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

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },

  loader: {
    marginTop: 32,
  },

  list: {
    paddingBottom: 120,
    flexGrow: 1,
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
    backgroundColor: '#F1F1F1',
  },

  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#087EBE',
  },

  rowContent: {
    flex: 1,
    marginLeft: 14,
  },

  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  name: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
  },

  nameUnread: {
    fontWeight: '800',
  },

  date: {
    fontSize: 12,
    color: '#8A8A8A',
  },

  rowFooter: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  preview: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },

  previewUnread: {
    color: '#111111',
    fontWeight: '600',
  },

  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#087EBE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
  },
});
