import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import {
  Camera,

  ImageIcon,
  Info,
  Mic,
  Send,
} from 'lucide-react-native';
import type {
  ChatMessages,
  PendingExchange,
  MessageCreatedSocketPayload,
  MessagesReadSocketPayload,
} from '@wim/shared';

import { getSession } from 'src/auth/infrastructure/authStorage';
import {
  getChatsApi,
  getMessagesApi,
  markChatAsReadApi,
  sendMessageApi,
  sendPhotoMessageApi,
} from '../infrastructure/chat.api';
import { resolveImageUrl } from 'src/home/infrastructure/home.api';
import { useChatSocket } from '../hooks/useChatSocket';
import {
  cancelExchangeApi,
  getChatExchangeApi,
  respondToExchangeApi,
  updateExchangeDatesApi,
} from '../infrastructure/exchange.api';
import { getHomesByOwner } from 'src/home/infrastructure/home.api';
import {
  blockUserApi,
  reportUserApi,
} from '../infrastructure/moderation.api';
import { ExchangeBanner } from './components/ExchangeBanner';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
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
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const insets = useSafeAreaInsets();
  const { chatId } = route.params;

  // L'ecran ne peut pas dependre de ce que l'appelant lui passe : ouvert depuis
  // les echanges ou une notification, il n'a que l'identifiant de la
  // conversation. Il retrouve donc lui-meme son interlocuteur.
  const [participant, setParticipant] = useState<{
    id?: string;
    firstName?: string;
    avatarUrl?: string | null;
  }>({
    id: route.params.participantId,
    firstName: route.params.participantName,
    avatarUrl: route.params.participantAvatar ?? null,
  });

  const participantId = participant.id;
  const participantName = participant.firstName;
  const participantAvatar = participant.avatarUrl;

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
  const [participantLastReadAt, setParticipantLastReadAt] = useState<string | null>(null);

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

        if (!route.params.participantId || !route.params.participantName) {
          const chats = await getChatsApi(session.accessToken);
          const current = chats.find((chat) => chat.id === chatId);

          if (current?.participant && !cancelled) {
            setParticipant({
              id: current.participant.id,
              firstName: current.participant.firstName,
              avatarUrl: current.participant.avatarUrl ?? null,
            });
          }
        }

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
        setParticipantLastReadAt(page.participantLastReadAt ?? null);
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

  // Revenir sur une conversation deja montee ne relance pas le chargement
  // initial : sans ce rafraichissement, un message ecrit ailleurs (une demande
  // d'echange, par exemple) n'apparaissait qu'apres etre ressorti de l'ecran.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function refresh() {
        try {
          const session = await getSession();

          if (!session?.accessToken || cancelled) return;

          const page = await getMessagesApi(session.accessToken, chatId, {
            limit: PAGE_SIZE,
            translate: translatedRef.current,
          });

          if (cancelled) return;

          setParticipantLastReadAt(page.participantLastReadAt ?? null);

          setMessages((current) => {
            const connus = new Set(current.map((message) => message.id));

            const nouveaux = page.messages.filter(
              (message) => !connus.has(message.id),
            );

            if (nouveaux.length === 0) return current;

            // On fusionne au lieu de remplacer : les messages plus anciens
            // deja charges ne doivent pas disparaitre.
            return [...nouveaux, ...current].sort(
              (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
            );
          });
        } catch (refreshError) {
          console.log('Refresh messages error:', refreshError);
        }
      }

      refresh();

      return () => {
        cancelled = true;
      };
    }, [chatId]),
  );

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

  const handleRead = useCallback(
    (payload: MessagesReadSocketPayload) => {
      // L'autre vient d'ouvrir la conversation : le "Vu" apparait sans avoir a
      // recharger la page.
      if (payload.userId !== currentUserId) {
        setParticipantLastReadAt(payload.readAt);
      }
    },
    [currentUserId],
  );

  useChatSocket({
    chatId,
    onMessage: handleIncomingMessage,
    onRead: handleRead,
  });

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

      // Le serveur renvoie aussi le message par websocket : sans ce garde-fou,
      // l'echo arrive avant la reponse HTTP et le message s'affiche deux fois.
      setMessages((current) =>
        current.some((item) => item.id === message.id)
          ? current
          : [message, ...current],
      );

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

  function cancelExchange() {
    setMenuOpen(false);

    if (!exchange) return;

    Alert.alert('', t('cancelExchangeConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('cancelExchangeConfirmed'),
        style: 'destructive',
        onPress: async () => {
          const session = await getSession();

          if (!session?.accessToken) return;

          try {
            await cancelExchangeApi(session.accessToken, exchange.id);
            setExchange(null);
          } catch (cancelError) {
            console.log('Cancel exchange error:', cancelError);
            Alert.alert('', t('cancelExchangeError'));
          }
        },
      },
    ]);
  }

  async function proposeExchange() {
    setMenuOpen(false);

    if (!participantId) return;

    const session = await getSession();

    if (!session?.accessToken) return;

    try {
      const homes = await getHomesByOwner(session.accessToken, participantId);

      if (homes.length === 0) {
        Alert.alert('', t('noHomeToExchange'));
        return;
      }

      // Un seul logement : inutile de faire choisir. Sinon on ouvre le profil,
      // ou ils sont tous presentes.
      if (homes.length === 1) {
        navigation.navigate('ExchangeAvailability', { homeId: homes[0].id });
        return;
      }

      navigation.navigate('PublicProfile', { userId: participantId });
    } catch (loadError) {
      console.log('Load participant homes error:', loadError);
      Alert.alert('', t('actionUnavailable'));
    }
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

  // "Vu" ne s'affiche que sous le dernier message que l'autre a reellement lu,
  // et non des l'envoi.
  const lastSeenOwnMessageId = participantLastReadAt
    ? messages.find(
        (message) =>
          message.senderId === currentUserId &&
          Date.parse(message.createdAt) <= Date.parse(participantLastReadAt),
      )?.id
    : undefined;

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

        {isMine && message.id === lastSeenOwnMessageId ? (
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
        <BackButton onPress={navigation.goBack} style={styles.headerButton} />

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
          <Info size={22} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      {exchange?.status === 'PENDING' ? (
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
          {messages.length === 0 && !loadingMore ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('noMessages')}</Text>
              <Text style={styles.emptyText}>{t('startConversation')}</Text>
            </View>
          ) : null}

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
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View
            style={[styles.composerArea, { paddingBottom: 10 + insets.bottom }]}
          >
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

            <View style={styles.composerCard}>
              <View style={styles.composerRow}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={takePhoto}
                  disabled={uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator
                      size="small"
                      color={themeColors.onContrast}
                    />
                  ) : (
                    <Camera size={19} color={themeColors.onContrast} />
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={t('messagePlaceholder')}
                  placeholderTextColor={themeColors.textFaint}
                  multiline
                />

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => Alert.alert('', t('voiceSoon'))}
                  activeOpacity={0.7}
                >
                  <Mic size={21} color={themeColors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={pickPhoto}
                  disabled={uploading}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={21} color={themeColors.text} />
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
          <View
            style={[
              styles.menuSheet,
              { paddingBottom: 20 + insets.bottom },
            ]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={blockParticipant}>
              <Text style={styles.menuDanger}>{t('blockUser')}</Text>
            </TouchableOpacity>

            {exchange ? (
              <TouchableOpacity style={styles.menuItem} onPress={cancelExchange}>
                <Text style={styles.menuText}>{t('cancelExchange')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={proposeExchange}>
                <Text style={styles.menuText}>{t('proposeExchange')}</Text>
              </TouchableOpacity>
            )}

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

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
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
    borderBottomColor: c.border,
  },

menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  menuSheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 8,
  },

  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 22,
  },

  menuText: {
    fontSize: 15,
    color: c.text,
  },

  menuDanger: {
    fontSize: 15,
    color: c.danger,
  },

  menuCancel: {
    fontSize: 15,
    fontWeight: '700',
    color: c.textMuted,
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
    backgroundColor: c.surfaceAlt,
  },

  headerAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: c.primary,
  },

  headerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: c.text,
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
    color: c.textMuted,
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
    backgroundColor: c.contrast,
  },

  bubbleTheirs: {
    backgroundColor: c.surfaceAlt,
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
    color: c.onContrast,
  },

  bubbleTextTheirs: {
    color: c.text,
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
    color: c.textMuted,
  },

  seen: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 10,
    marginRight: 4,
    fontSize: 11,
    color: c.textMuted,
  },

  // Rendu hors de la liste inversee : a l'interieur, il heritait du
  // retournement et s'affichait a l'envers.
  empty: {
    ...StyleSheet.absoluteFillObject,
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

  error: {
    paddingHorizontal: 18,
    paddingBottom: 6,
    fontSize: 12,
    color: c.danger,
  },

  composerArea: {
    backgroundColor: c.screen,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  composerCard: {
    backgroundColor: c.surface,
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
    paddingBottom: 10,
    fontSize: 11,
    color: c.textMuted,
    textAlign: 'center',
  },

  translationLink: {
    color: c.textMuted,
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
    backgroundColor: c.contrast,
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
    color: c.text,
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
    backgroundColor: c.border,
  },

  bubbleTimeOnImage: {
    marginRight: 6,
  },
});
