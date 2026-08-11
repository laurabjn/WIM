import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  ChevronLeft,
  ImageIcon,
  Info,
  Mic,
  Send,
} from 'lucide-react-native';
import type {
  ChatMessages,
  PendingExchange,
  MessageCreatedSocketPayload,
} from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  getMessagesApi,
  markChatAsReadApi,
  sendMessageApi,
} from '../infrastructure/chat.api';
import { useChatSocket } from '../hooks/useChatSocket';
import {
  getChatExchangeApi,
  respondToExchangeApi,
} from '../infrastructure/exchange.api';
import { ExchangeBanner } from './components/ExchangeBanner';
import {
  formatMessageDay,
  formatMessageTime,
  isSameDay,
} from '../utils/formatMessageDay';

const PAGE_SIZE = 30;

type Props = {
  route: {
    params: {
      chatId: string;
      participantId?: string;
      participantName?: string;
      participantAvatar?: string | null;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export function ConversationScreen({ route, navigation }: Props) {
  const { t } = useTranslation('chat');
  const {
    chatId,
    participantId,
    participantName,
    participantAvatar,
  } = route.params;

  const [messages, setMessages] = useState<ChatMessages[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exchange, setExchange] = useState<PendingExchange | null>(null);

  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();

        if (!session?.accessToken || cancelled) return;

        setCurrentUserId(session.user?.id ?? null);

        const page = await getMessagesApi(session.accessToken, chatId, {
          limit: PAGE_SIZE,
        });

        if (cancelled) return;

        setMessages(page.messages);
        cursorRef.current = page.nextCursor;
        hasMoreRef.current = page.hasMore;

        await markChatAsReadApi(session.accessToken, chatId);

        const pending = await getChatExchangeApi(session.accessToken, chatId);

        if (!cancelled) setExchange(pending);
      } catch (loadError) {
        console.log('Load messages error:', loadError);
        if (!cancelled) setError(t('loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [chatId, t]);

  const handleIncomingMessage = useCallback(
    (payload: MessageCreatedSocketPayload) => {
      setMessages((current) =>
        current.some((message) => message.id === payload.message.id)
          ? current
          : [payload.message, ...current],
      );
    },
    [],
  );

  useChatSocket({ chatId, onMessage: handleIncomingMessage });

  const loadEarlier = useCallback(async () => {
    if (!hasMoreRef.current || loadingMore || !cursorRef.current) return;

    setLoadingMore(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const page = await getMessagesApi(session.accessToken, chatId, {
        cursor: cursorRef.current,
        limit: PAGE_SIZE,
      });

      setMessages((current) => [...current, ...page.messages]);
      cursorRef.current = page.nextCursor;
      hasMoreRef.current = page.hasMore;
    } catch (loadError) {
      console.log('Load earlier messages error:', loadError);
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, loadingMore]);

  async function handleSend() {
    const content = draft.trim();

    if (!content || sending) return;

    setSending(true);
    setDraft('');

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const message = await sendMessageApi(
        session.accessToken,
        chatId,
        content,
      );

      setMessages((current) => [message, ...current]);
      setError(null);
    } catch (sendError) {
      console.log('Send message error:', sendError);
      setDraft(content);
      setError(t('sendError'));
    } finally {
      setSending(false);
    }
  }

  function openMenu() {
    Alert.alert(participantName ?? '', undefined, [
      {
        text: t('blockUser'),
        onPress: () => Alert.alert('', t('actionUnavailable')),
      },
      {
        text: t('deleteExchange'),
        style: 'destructive',
        onPress: async () => {
          if (!exchange) {
            Alert.alert('', t('actionUnavailable'));
            return;
          }

          const session = await getSession();

          if (!session?.accessToken) return;

          await respondToExchangeApi(
            session.accessToken,
            exchange.id,
            'DECLINE',
          );

          setExchange(null);
        },
      },
      {
        text: t('report'),
        onPress: () => Alert.alert('', t('actionUnavailable')),
      },
      { text: t('cancel'), style: 'cancel' },
    ]);
  }

  const lastOwnMessageId = messages.find(
    (message) => message.senderId === currentUserId,
  )?.id;

  function renderMessage(message: ChatMessages, index: number) {
    const isMine = message.senderId === currentUserId;

    const older = messages[index + 1];
    const startsNewDay =
      !older || !isSameDay(message.createdAt, older.createdAt);

    const newer = messages[index - 1];
    const isLastOfGroup =
      !newer || newer.senderId !== message.senderId;

    return (
      <View>
        <View
          style={[
            styles.bubbleRow,
            isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
            isLastOfGroup ? styles.bubbleRowSpaced : null,
          ]}
        >
          <View
            style={[
              styles.bubble,
              isMine ? styles.bubbleMine : styles.bubbleTheirs,
              isLastOfGroup
                ? isMine
                  ? styles.bubbleMineTail
                  : styles.bubbleTheirsTail
                : null,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
              ]}
            >
              {message.content}
            </Text>

            <Text
              style={[
                styles.bubbleTime,
                isMine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs,
              ]}
            >
              {formatMessageTime(message.createdAt)}
            </Text>
          </View>
        </View>

        {isMine && message.id === lastOwnMessageId ? (
          <Text style={styles.seen}>{t('seenLabel')}</Text>
        ) : null}

        {startsNewDay ? (
          <View style={styles.daySeparator}>
            <Text style={styles.dayText}>
              {formatMessageDay(message.createdAt, t)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={navigation.goBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={26} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIdentity}
          activeOpacity={0.7}
          disabled={!participantId}
          onPress={() =>
            navigation.navigate('PublicProfile', { userId: participantId })
          }
        >
          {participantAvatar ? (
            <Image
              source={{ uri: participantAvatar }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
              <Text style={styles.headerInitial}>
                {(participantName ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.headerName} numberOfLines={1}>
            {participantName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={openMenu}
        >
          <Info size={22} color="#111111" />
        </TouchableOpacity>
      </View>

      {exchange?.isHost ? (
        <ExchangeBanner
          exchange={exchange}
          onRespond={async (response) => {
            const session = await getSession();

            if (!session?.accessToken) return;

            await respondToExchangeApi(
              session.accessToken,
              exchange.id,
              response,
            );

            setExchange(null);
          }}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#087EBE" />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <FlatList
            data={messages}
            keyExtractor={(message) => message.id}
            renderItem={({ item, index }) => renderMessage(item, index)}
            inverted
            contentContainerStyle={styles.list}
            onEndReached={loadEarlier}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator style={styles.moreLoader} color="#087EBE" />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>{t('noMessages')}</Text>
                <Text style={styles.emptyText}>{t('startConversation')}</Text>
              </View>
            }
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.composer}>
            <View style={styles.cameraButton}>
              <Camera size={18} color="#FFFFFF" />
            </View>

            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={t('messagePlaceholder')}
              placeholderTextColor="#9CA3AF"
              multiline
            />

            {draft.trim() ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={sending}
                activeOpacity={0.8}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.composerIcons}>
                <Mic size={20} color="#9CA3AF" />
                <ImageIcon size={20} color="#9CA3AF" />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  flex: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },

  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F1F1',
  },

  headerAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#087EBE',
  },

  headerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },

  loader: {
    marginTop: 32,
  },

  list: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexGrow: 1,
  },

  moreLoader: {
    marginVertical: 12,
  },

  daySeparator: {
    alignItems: 'center',
    marginVertical: 14,
  },

  dayText: {
    fontSize: 12,
    color: '#8A8A8A',
    textTransform: 'capitalize',
  },

  bubbleRow: {
    marginBottom: 2,
    flexDirection: 'row',
  },

  bubbleRowSpaced: {
    marginBottom: 10,
  },

  bubbleRowMine: {
    justifyContent: 'flex-end',
  },

  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },

  bubble: {
    maxWidth: '76%',
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 7,
    borderRadius: 22,
  },

  bubbleMine: {
    backgroundColor: '#111111',
  },

  bubbleTheirs: {
    backgroundColor: '#F1F1F1',
  },

  bubbleMineTail: {
    borderBottomRightRadius: 6,
  },

  bubbleTheirsTail: {
    borderBottomLeftRadius: 6,
  },

  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },

  bubbleTextMine: {
    color: '#FFFFFF',
  },

  bubbleTextTheirs: {
    color: '#111111',
  },

  bubbleTime: {
    marginTop: 3,
    fontSize: 10,
    alignSelf: 'flex-end',
  },

  bubbleTimeMine: {
    color: 'rgba(255,255,255,0.6)',
  },

  bubbleTimeTheirs: {
    color: '#9CA3AF',
  },

  seen: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 10,
    marginRight: 4,
    fontSize: 11,
    color: '#9CA3AF',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    transform: [{ scaleY: -1 }],
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

  error: {
    paddingHorizontal: 18,
    paddingBottom: 6,
    fontSize: 12,
    color: '#DC2626',
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },

  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 9,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D5DB',
    fontSize: 14,
    color: '#111111',
  },

  composerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingRight: 4,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#087EBE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
