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
import { Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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
  sendPhotoMessageApi,
} from '../infrastructure/chat.api';
import { resolveImageUrl } from 'src/home/infrastructure/home.api';
import { useChatSocket } from '../hooks/useChatSocket';
import {
  getChatExchangeApi,
  respondToExchangeApi,
  updateExchangeDatesApi,
} from '../infrastructure/exchange.api';
import {
  blockUserApi,
  reportUserApi,
} from '../infrastructure/moderation.api';
import { ExchangeBanner } from './components/ExchangeBanner';
import {
  formatMessageDay,
  formatMessageTime,
  isSameDay,
} from '../utils/formatMessageDay';

const PAGE_SIZE = 30;

const translationKey = (chatId: string) => `chat:translate:${chatId}`;

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translated, setTranslated] = useState(true);

  const translatedRef = useRef(true);

  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();

        if (!session?.accessToken || cancelled) return;

        setCurrentUserId(session.user?.id ?? null);

        const stored = await AsyncStorage.getItem(translationKey(chatId));
        const wantsTranslation = stored !== 'off';

        translatedRef.current = wantsTranslation;

        if (!cancelled) setTranslated(wantsTranslation);

        const page = await getMessagesApi(session.accessToken, chatId, {
          limit: PAGE_SIZE,
          translate: wantsTranslation,
        });

        if (cancelled) return;

        setMessages(page.messages);
        cursorRef.current = page.nextCursor;
        hasMoreRef.current = page.hasMore;

        markChatAsReadApi(session.accessToken, chatId).catch((readError) =>
          console.log('Mark as read error:', readError),
        );

        getChatExchangeApi(session.accessToken, chatId)
          .then((pending) => {
            if (!cancelled) setExchange(pending);
          })
          .catch((exchangeError) =>
            console.log('Load exchange error:', exchangeError),
          );
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
        translate: translatedRef.current,
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

  async function disableTranslation() {
    translatedRef.current = false;

    setTranslated(false);

    await AsyncStorage.setItem(translationKey(chatId), 'off');
  }

  async function sendPhoto(uri: string) {
    setUploading(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const message = await sendPhotoMessageApi(
        session.accessToken,
        chatId,
        uri,
      );

      setMessages((current) =>
        current.some((item) => item.id === message.id)
          ? current
          : [message, ...current],
      );

      setError(null);
    } catch (photoError) {
      console.log('Send photo error:', photoError);
      setError(t('photoError'));
    } finally {
      setUploading(false);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('', t('cameraDenied'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await sendPhoto(result.assets[0].uri);
    }
  }

  async function pickPhoto() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('', t('galleryDenied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await sendPhoto(result.assets[0].uri);
    }
  }

  async function blockParticipant() {
    setMenuOpen(false);

    if (!participantId) return;

    const session = await getSession();

    if (!session?.accessToken) return;

    await blockUserApi(session.accessToken, participantId);

    Alert.alert('', t('blocked'));
    navigation.goBack();
  }

  async function deleteExchange() {
    setMenuOpen(false);

    if (!exchange) {
      Alert.alert('', t('actionUnavailable'));
      return;
    }

    const session = await getSession();

    if (!session?.accessToken) return;

    await respondToExchangeApi(session.accessToken, exchange.id, 'DECLINE');
    setExchange(null);
  }

  async function reportParticipant() {
    setMenuOpen(false);

    if (!participantId) return;

    const session = await getSession();

    if (!session?.accessToken) return;

    await reportUserApi(session.accessToken, participantId, t('reportReason'));

    Alert.alert('', t('reported'));
  }

  const showTranslationNotice =
    translated && messages.some((message) => message.translatedContent);

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
              message.type === 'IMAGE' ? styles.bubbleImage : null,
            ]}
          >
            {message.type === 'IMAGE' && message.attachmentUrl ? (
              <Image
                source={{ uri: resolveImageUrl(message.attachmentUrl) ?? '' }}
                style={styles.attachment}
                resizeMode="cover"
              />
            ) : (
              <Text
                style={[
                  styles.bubbleText,
                  isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                ]}
              >
                {translated && message.translatedContent
                  ? message.translatedContent
                  : message.content}
              </Text>
            )}

            <Text
              style={[
                styles.bubbleTime,
                isMine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs,
                message.type === 'IMAGE' ? styles.bubbleTimeOnImage : null,
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
          onPress={() => setMenuOpen(true)}
        >
          <Info size={22} color="#111111" />
        </TouchableOpacity>
      </View>

      {exchange ? (
        <ExchangeBanner
          exchange={exchange}
          onAccept={async () => {
            const session = await getSession();

            if (!session?.accessToken) return;

            await respondToExchangeApi(
              session.accessToken,
              exchange.id,
              'ACCEPT',
            );

            setExchange(null);
          }}
          onChangeDates={async (start, end) => {
            const session = await getSession();

            if (!session?.accessToken) return;

            const updated = await updateExchangeDatesApi(
              session.accessToken,
              exchange.id,
              start.toISOString(),
              end.toISOString(),
            );

            setExchange(updated);
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

          <View style={styles.composerArea}>
            <View style={styles.composerCard}>
              {showTranslationNotice ? (
                <Text style={styles.translationNotice}>
                  {t('autoTranslated')}{' '}
                  <Text
                    style={styles.translationLink}
                    onPress={disableTranslation}
                  >
                    {t('removeTranslation')}
                  </Text>
                </Text>
              ) : null}

              <View style={styles.composerRow}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={takePhoto}
                  disabled={uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Camera size={19} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={t('messagePlaceholder')}
                  placeholderTextColor="#B4B4B8"
                  multiline
                />

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => Alert.alert('', t('voiceSoon'))}
                  activeOpacity={0.7}
                >
                  <Mic size={21} color="#111111" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={pickPhoto}
                  disabled={uploading}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={21} color="#111111" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSend}
                  disabled={sending || !draft.trim()}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#2DA7F3', '#52D1A6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.sendButton,
                      !draft.trim() ? styles.sendButtonIdle : null,
                    ]}
                  >
                    <Send size={19} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.menuSheet}>
            <TouchableOpacity style={styles.menuItem} onPress={blockParticipant}>
              <Text style={styles.menuDanger}>{t('blockUser')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={deleteExchange}>
              <Text style={styles.menuText}>{t('deleteExchange')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={reportParticipant}>
              <Text style={styles.menuText}>{t('report')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuCancel}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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

menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  menuSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingVertical: 8,
    paddingBottom: 26,
  },

  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 22,
  },

  menuText: {
    fontSize: 15,
    color: '#111111',
  },

  menuDanger: {
    fontSize: 15,
    color: '#DC2626',
  },

  menuCancel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
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

  composerArea: {
    paddingHorizontal: 10,
    paddingBottom: 6,
  },

  composerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  translationNotice: {
    paddingTop: 4,
    paddingBottom: 10,
    fontSize: 11,
    color: '#8A8A8E',
    textAlign: 'center',
  },

  translationLink: {
    color: '#8A8A8E',
    textDecorationLine: 'underline',
  },

  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cameraButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    flex: 1,
    maxHeight: 110,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },

  iconButton: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonIdle: {
    opacity: 0.45,
  },

  bubbleImage: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 4,
    overflow: 'hidden',
  },

  attachment: {
    width: 210,
    height: 210,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },

  bubbleTimeOnImage: {
    marginRight: 6,
  },
});
