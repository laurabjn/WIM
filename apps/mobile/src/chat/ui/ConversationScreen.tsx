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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Send } from 'lucide-react-native';
import type { ChatMessages } from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  getMessagesApi,
  markChatAsReadApi,
  sendMessageApi,
} from '../infrastructure/chat.api';

const PAGE_SIZE = 30;

type Props = {
  route: {
    params: {
      chatId: string;
      participantName?: string;
      participantAvatar?: string | null;
    };
  };
  navigation: {
    goBack: () => void;
  };
};

export function ConversationScreen({ route, navigation }: Props) {
  const { t } = useTranslation('chat');
  const { chatId, participantName, participantAvatar } = route.params;

  const [messages, setMessages] = useState<ChatMessages[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();

        if (!session?.accessToken) return;
        if (cancelled) return;

        setCurrentUserId(session.user?.id ?? null);

        const page = await getMessagesApi(session.accessToken, chatId, {
          limit: PAGE_SIZE,
        });

        if (cancelled) return;

        setMessages(page.messages);
        cursorRef.current = page.nextCursor;
        hasMoreRef.current = page.hasMore;

        await markChatAsReadApi(session.accessToken, chatId);
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
    } catch (sendError) {
      console.log('Send message error:', sendError);
      setDraft(content);
      setError(t('sendError'));
    } finally {
      setSending(false);
    }
  }

  function renderMessage(message: ChatMessages) {
    const isMine = message.senderId === currentUserId;

    return (
      <View
        style={[
          styles.bubbleRow,
          isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
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
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={navigation.goBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#111111" />
        </TouchableOpacity>

        {participantAvatar ? (
          <Image source={{ uri: participantAvatar }} style={styles.headerAvatar} />
        ) : null}

        <Text style={styles.headerName} numberOfLines={1}>
          {participantName}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#087EBE" />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            data={messages}
            keyExtractor={(message) => message.id}
            renderItem={({ item }) => renderMessage(item)}
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
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={t('messagePlaceholder')}
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                !draft.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!draft.trim() || sending}
              activeOpacity={0.8}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F1F1',
  },

  headerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },

  loader: {
    marginTop: 32,
  },

  list: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexGrow: 1,
  },

  moreLoader: {
    marginVertical: 12,
  },

  bubbleRow: {
    marginBottom: 8,
    flexDirection: 'row',
  },

  bubbleRowMine: {
    justifyContent: 'flex-end',
  },

  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },

  bubbleMine: {
    backgroundColor: '#111111',
    borderBottomRightRadius: 6,
  },

  bubbleTheirs: {
    backgroundColor: '#F1F1F1',
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
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },

  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 22,
    backgroundColor: '#F4F4F5',
    fontSize: 14,
    color: '#111111',
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#087EBE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: '#C7D2DA',
  },
});
