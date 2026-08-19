import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
import { Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import type {
  ChatUpdatedSocketPayload,
  MyChatListItem,
} from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  getMyProfile,
  updateMyProfile,
} from 'src/profile/infrastructure/profile.api';
import { getChatsApi } from '../infrastructure/chat.api';
import { connectChatSocket } from '../infrastructure/chatSocket';
import { usePresence } from '../hooks/usePresence';
import { formatRelativeDate } from '../utils/formatRelativeDate';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export function ConversationsScreen({ navigation }: Props) {
  const { t } = useTranslation('chat');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [chats, setChats] = useState<MyChatListItem[]>([]);
  const [myStatus, setMyStatus] = useState<string | null>(null);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
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

      // Le statut et l'avatar de l'utilisateur alimentent la premiere vignette
      // de la rangee : un echec ici ne doit pas priver de conversations.
      try {
        const profil = await getMyProfile(session.accessToken);

        setMyStatus(profil.status ?? null);
        setMyAvatar(profil.avatarUrl ?? null);
      } catch (profilError) {
        console.log('Load own status error:', profilError);
      }
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

  const presence = usePresence(
    chats.map((chat) => chat.participant?.id).filter(Boolean) as string[],
  );

  const requests = chats.filter((chat) => chat.isRequest);
  const conversations = chats.filter((chat) => !chat.isRequest);
  const visible = tab === 'requests' ? requests : conversations;

  function handleRefresh() {
    setRefreshing(true);
    loadChats();
  }

  async function saveStatus(texte: string) {
    setSavingStatus(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const profil = await updateMyProfile(session.accessToken, {
        statusText: texte,
      });

      setMyStatus(profil.status ?? null);
      setStatusOpen(false);
    } catch (statusError) {
      console.log('Save status error:', statusError);
      Alert.alert('', t('statusError'));
    } finally {
      setSavingStatus(false);
    }
  }

  function openStatusEditor() {
    setStatusDraft(myStatus ?? '');
    setStatusOpen(true);
  }

  function renderChat(chat: MyChatListItem) {
    const participant = chat.participant;
    const hasUnread = chat.unreadCount > 0;
    const isOnline = participant?.id
      ? presence.online.has(participant.id)
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
                  : chat.lastMessage.type === 'AUDIO'
                    ? t('voicePreview')
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
        style={styles.statusScroll}
        contentContainerStyle={styles.statusRow}
      >
        <TouchableOpacity
          style={styles.statusItem}
          activeOpacity={0.8}
          onPress={openStatusEditor}
        >
          <View style={styles.statusBubble}>
            <Text style={styles.statusBubbleText} numberOfLines={2}>
              {myStatus ?? t('shareStatus')}
            </Text>
          </View>

          {myAvatar ? (
            <Image source={{ uri: myAvatar }} style={styles.statusAvatar} />
          ) : (
            <View style={[styles.statusAvatar, styles.statusAvatarOwn]} />
          )}
        </TouchableOpacity>

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
            {chat.participant?.status ? (
              <View style={styles.statusBubble}>
                <Text style={styles.statusBubbleText} numberOfLines={2}>
                  {chat.participant.status}
                </Text>
              </View>
            ) : (
              // Sans bulle, la vignette remonterait et casserait l'alignement
              // de la rangee.
              // Le vide garde l'alignement : sans lui, les visages sans
              // statut remonteraient au-dessus des autres.
              <View style={styles.statusBubblePlaceholder} />
            )}

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

      <Modal
        visible={statusOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setStatusOpen(false)}
      >
        <View style={styles.statusModalBackdrop}>
          <View style={styles.statusSheet}>
            <Text style={styles.statusSheetTitle}>{t('statusTitle')}</Text>

            <TextInput
              style={styles.statusInput}
              value={statusDraft}
              onChangeText={setStatusDraft}
              placeholder={t('statusPlaceholder')}
              placeholderTextColor={themeColors.textFaint}
              maxLength={80}
              multiline
            />

            <View style={styles.statusActions}>
              {myStatus ? (
                <TouchableOpacity
                  style={styles.statusAction}
                  disabled={savingStatus}
                  onPress={() => saveStatus('')}
                >
                  <Text style={styles.statusActionText}>{t('statusClear')}</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.statusAction}
                disabled={savingStatus}
                onPress={() => setStatusOpen(false)}
              >
                <Text style={styles.statusActionText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusAction, styles.statusActionPrimary]}
                disabled={savingStatus || !statusDraft.trim()}
                onPress={() => saveStatus(statusDraft)}
              >
                {savingStatus ? (
                  <ActivityIndicator
                    size="small"
                    color={themeColors.onContrast}
                  />
                ) : (
                  <Text
                    style={[
                      styles.statusActionText,
                      styles.statusActionPrimaryText,
                    ]}
                  >
                    {t('statusSave')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: c.text,
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
    borderBottomColor: c.border,
  },

  matchesLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },

  matchesCount: {
    fontSize: 18,
    color: c.textMuted,
  },

  // Un ScrollView naît avec flexGrow: 1 : sans cette bride, celui des statuts
  // occupait toute la hauteur libre et repoussait les conversations en bas.
  statusScroll: {
    flexGrow: 0,
  },

  statusRow: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },

  statusItem: {
    maxWidth: 104,
    alignItems: 'center',
  },

  statusBubble: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },

  statusBubblePlaceholder: {
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 8,
  },

  statusBubbleText: {
    fontSize: 11,
    fontWeight: '600',
    color: c.text,
    textAlign: 'center',
  },

  statusAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: c.surfaceAlt,
  },

  statusAvatarOwn: {
    borderWidth: 1,
    borderColor: c.border,
    borderStyle: 'dashed',
  },

  statusModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: c.overlay,
  },

  statusSheet: {
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: c.surface,
  },

  statusSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: c.text,
  },

  statusInput: {
    marginTop: 14,
    padding: 12,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    fontSize: 15,
    color: c.text,
  },

  statusActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },

  statusAction: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusActionPrimary: {
    backgroundColor: c.contrast,
  },

  statusActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },

  statusActionPrimaryText: {
    color: c.onContrast,
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
    color: c.text,
  },

  requestsLink: {
    fontSize: 14,
    fontWeight: '600',
    color: c.primary,
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
    backgroundColor: c.surfaceAlt,
  },

  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: c.success,
    borderWidth: 2,
    borderColor: c.surface,
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

  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  name: {
    flex: 1,
    fontSize: 15,
    color: c.text,
  },

  nameUnread: {
    fontWeight: '800',
  },

  date: {
    fontSize: 12,
    color: c.textMuted,
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
    color: c.textMuted,
  },

  previewUnread: {
    color: c.text,
    fontWeight: '600',
  },

  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: c.primary,
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
    color: c.text,
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: c.textMuted,
    textAlign: 'center',
  },
});
