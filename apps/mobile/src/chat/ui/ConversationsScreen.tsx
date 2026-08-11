import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import type {
  ChatUpdatedSocketPayload,
  MyChatListItem,
} from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import { getChatsApi } from '../infrastructure/chat.api';
import { connectChatSocket } from '../infrastructure/chatSocket';
import { usePresence } from '../hooks/usePresence';
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
  const [tab, setTab] = useState<'messages' | 'requests'>('messages');

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

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function listen() {
      const session = await getSession();

      if (!session?.accessToken || cancelled) return;

      const socket = connectChatSocket(session.accessToken);

      function handleChatUpdated(payload: ChatUpdatedSocketPayload) {
        setChats((current) => {
          const index = current.findIndex((chat) => chat.id === payload.chatId);

          if (index === -1) {
            loadChats();
            return current;
          }

          const updated = {
            ...current[index],
            lastMessage: payload.lastMessage,
            unreadCount: payload.unreadCount ?? current[index].unreadCount,
          };

          return [
            updated,
            ...current.filter((chat) => chat.id !== payload.chatId),
          ];
        });
      }

      socket.on('chat:updated', handleChatUpdated);

      cleanup = () => socket.off('chat:updated', handleChatUpdated);
    }

    listen();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [loadChats]);

  const onlineUsers = usePresence(
    chats.map((chat) => chat.participant?.id).filter(Boolean) as string[],
  );

  const requests = chats.filter((chat) => chat.isRequest);
  const conversations = chats.filter((chat) => !chat.isRequest);
  const visible = tab === 'requests' ? requests : conversations;

  function handleRefresh() {
    setRefreshing(true);
    loadChats();
  }

  function renderChat(chat: MyChatListItem) {
    const participant = chat.participant;
    const hasUnread = chat.unreadCount > 0;
    const isOnline = participant?.id
      ? onlineUsers.has(participant.id)
      : false;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('Conversation', {
            chatId: chat.id,
            participantId: participant?.id,
            participantName: participant?.firstName ?? '',
            participantAvatar: participant?.avatarUrl ?? null,
          })
        }
      >
        <View>
          {participant?.avatarUrl ? (
            <Image
              source={{ uri: participant.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {(participant?.firstName ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {isOnline ? <View style={styles.onlineDot} /> : null}
        </View>

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
              {chat.lastMessage
                ? chat.lastMessage.type === 'IMAGE'
                  ? t('photoPreview')
                  : chat.lastMessage.content
                : t('startConversation')}
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusRow}
      >
        <View style={styles.statusItem}>
          <View style={[styles.statusAvatar, styles.statusAvatarOwn]} />
          <Text style={styles.statusLabel} numberOfLines={2}>
            {t('shareStatus')}
          </Text>
        </View>

        {conversations.slice(0, 8).map((chat) => (
          <TouchableOpacity
            key={`status-${chat.id}`}
            style={styles.statusItem}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Conversation', {
                chatId: chat.id,
                participantId: chat.participant?.id,
                participantName: chat.participant?.firstName ?? '',
                participantAvatar: chat.participant?.avatarUrl ?? null,
              })
            }
          >
            {chat.participant?.avatarUrl ? (
              <Image
                source={{ uri: chat.participant.avatarUrl }}
                style={styles.statusAvatar}
              />
            ) : (
              <View style={[styles.statusAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {(chat.participant?.firstName ?? '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <Text style={styles.statusLabel} numberOfLines={1}>
              {chat.participant?.firstName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>{t('tabMessages')}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Requests')}
        >
          <Text style={styles.requestsLink}>
            {t('tabRequests')}
            {requests.length > 0 ? ` (${requests.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#087EBE" />
      ) : (
        <FlatList

          data={conversations}
          keyExtractor={(chat) => chat.id}
          renderItem={({ item }) => renderChat(item)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {error ??
                  (tab === 'requests' ? t('emptyRequests') : t('empty'))}
              </Text>

              {error ? null : (
                <Text style={styles.emptyText}>
                  {tab === 'requests'
                    ? t('emptyRequestsDescription')
                    : t('emptyDescription')}
                </Text>
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

  matchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },

  matchesLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },

  matchesCount: {
    fontSize: 18,
    color: '#9CA3AF',
  },

statusRow: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 14,
  },

  statusItem: {
    width: 72,
    alignItems: 'center',
  },

  statusAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F1F1F1',
  },

  statusAvatarOwn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },

  statusLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  requestsLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#087EBE',
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

  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
