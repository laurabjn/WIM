import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { usePendingStayReview } from 'src/home/infrastructure/hooks/usePendingStayReview';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Alert, Modal, Pressable } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '@jamsch/expo-speech-recognition';
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
  sendVoiceMessageApi,
  editMessageApi,
  deleteMessageApi,
  searchMessagesApi,
} from '../infrastructure/chat.api';
import { resolveImageUrl } from 'src/home/infrastructure/home.api';
import { useChatSocket } from '../hooks/useChatSocket';
import { usePresence } from '../hooks/usePresence';
import { formatLastSeen } from '../utils/formatLastSeen';
import { getChatSocket } from '../infrastructure/chatSocket';
import {
  cancelExchangeApi,
  getChatExchangeApi,
  fetchGuestHomesApi,
  respondToExchangeApi,
  type LogementCandidat,
  updateExchangeDatesApi,
} from '../infrastructure/exchange.api';
import { getHomesByOwner } from 'src/home/infrastructure/home.api';
import {
  blockUserApi,
  reportUserApi,
} from '../infrastructure/moderation.api';
import { ExchangeBanner } from './components/ExchangeBanner';
import { GuestHomeChoiceModal } from './components/GuestHomeChoiceModal';
import { fetchLikedHomesApi } from 'src/swipe/infrastructure/swipe.api';
import { VoiceMessageBubble } from './components/VoiceMessageBubble';
import { TypingBubble } from './components/TypingBubble';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import {
  formatMessageDay,
  formatMessageTime,
  isSameDay,
} from '../utils/formatMessageDay';

const PAGE_SIZE = 30;

const REPORT_REASONS = [
  'harassment',
  'inappropriate',
  'scam',
  'fakeProfile',
  'spam',
  'other',
] as const;

const TYPING_STOP_MS = 2500;
const TYPING_EXPIRY_MS = 4000;

const MIN_RECORDING_MS = 800;
const MAX_RECORDING_MS = 3 * 60 * 1000;
const AUDIO_FILE_TIMEOUT_MS = 8000;

const translationKey = (chatId: string) => `chat:translate:${chatId}`;

function apercuMessage(message: {
  type: string;
  content: string;
}): string {
  if (message.type === 'IMAGE') return 'Photo';
  if (message.type === 'AUDIO' && !message.content) return 'Message vocal';

  return message.content;
}

function formatRecordingTime(millisecondes: number) {
  const secondes = Math.floor(millisecondes / 1000);

  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`;
}

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
  const { t, i18n } = useTranslation('chat');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const insets = useSafeAreaInsets();
  const { chatId } = route.params;

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

  const presence = usePresence(participantId ? [participantId] : []);

  const participantOnline = participantId
    ? presence.online.has(participantId)
    : false;

  const participantLastSeen = participantId
    ? presence.lastSeen.get(participantId)
    : undefined;
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
  const [logementsCandidats, setLogementsCandidats] = useState<
    LogementCandidat[]
  >([]);
  const [logementsAProposer, setLogementsAProposer] = useState<
    LogementCandidat[]
  >([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessages | null>(null);
  const [actionsFor, setActionsFor] = useState<ChatMessages | null>(null);
  const sejourANoter = usePendingStayReview();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessages[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translated, setTranslated] = useState(true);
  const [participantLastReadAt, setParticipantLastReadAt] = useState<string | null>(null);

  const translatedRef = useRef(true);
  const [translationEpoch, setTranslationEpoch] = useState(0);

  const [recording, setRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [participantTyping, setParticipantTyping] = useState(false);
  const typingSentAtRef = useRef(0);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartedAt = useRef(0);
  const transcriptRef = useRef('');
  const finalPartsRef = useRef<string[]>([]);
  const audioEndRef = useRef<((uri: string | null) => void) | null>(null);
  const stoppingRef = useRef(false);

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
  }, [chatId, t, translationEpoch]);

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

          getChatExchangeApi(session.accessToken, chatId)
            .then((pending) => {
              if (!cancelled) setExchange(pending);
            })
            .catch((exchangeError) =>
              console.log('Refresh exchange error:', exchangeError),
            );

          setMessages((current) => {
            const connus = new Set(current.map((message) => message.id));

            const nouveaux = page.messages.filter(
              (message) => !connus.has(message.id),
            );

            if (nouveaux.length === 0) return current;

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
      if (payload.userId !== currentUserId) {
        setParticipantLastReadAt(payload.readAt);
      }
    },
    [currentUserId],
  );

  const handleTyping = useCallback(
    (payload: { chatId: string; userId: string; isTyping: boolean }) => {
      if (payload.userId === currentUserId) return;

      setParticipantTyping(payload.isTyping);

      if (typingClearRef.current) clearTimeout(typingClearRef.current);

      if (payload.isTyping) {
        typingClearRef.current = setTimeout(
          () => setParticipantTyping(false),
          TYPING_EXPIRY_MS,
        );
      }
    },
    [currentUserId],
  );

  const handleMessageUpdated = useCallback(
    (payload: MessageCreatedSocketPayload) => {
      setMessages((actuels) =>
        actuels.map((item) =>
          item.id === payload.message.id ? payload.message : item,
        ),
      );
    },
    [],
  );

  const handleMessageDeleted = useCallback(
    (payload: { messageId: string }) => {
      setMessages((actuels) =>
        actuels.filter((item) => item.id !== payload.messageId),
      );
    },
    [],
  );

  useChatSocket({
    chatId,
    onMessage: handleIncomingMessage,
    onRead: handleRead,
    onTyping: handleTyping,
    onMessageUpdated: handleMessageUpdated,
    onMessageDeleted: handleMessageDeleted,
  });

  useEffect(
    () => () => {
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);

      getChatSocket()?.emit('typing', { chatId, isTyping: false });
    },
    [chatId],
  );

  function emitTyping(isTyping: boolean) {
    getChatSocket()?.emit('typing', { chatId, isTyping });
  }

  function handleDraftChange(texte: string) {
    setDraft(texte);

    const maintenant = Date.now();

    if (maintenant - typingSentAtRef.current > 1000) {
      typingSentAtRef.current = maintenant;

      emitTyping(true);
    }

    if (typingStopRef.current) clearTimeout(typingStopRef.current);

    typingStopRef.current = setTimeout(() => {
      typingSentAtRef.current = 0;

      emitTyping(false);
    }, TYPING_STOP_MS);
  }

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

    if (typingStopRef.current) clearTimeout(typingStopRef.current);

    typingSentAtRef.current = 0;

    emitTyping(false);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const message = await sendMessageApi(
        session.accessToken,
        chatId,
        content,
        replyTo?.id ?? null,
      );

      setReplyTo(null);

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

  async function applyTranslation(next: boolean) {
    translatedRef.current = next;

    setTranslated(next);

    await AsyncStorage.setItem(translationKey(chatId), next ? 'on' : 'off');

    if (next) setTranslationEpoch((epoch) => epoch + 1);
  }

  function toggleTranslation() {
    setMenuOpen(false);

    applyTranslation(!translated);
  }

  useSpeechRecognitionEvent('result', (event) => {
    const texte = event.results?.[0]?.transcript?.trim() ?? '';

    if (!texte) return;

    if (Platform.OS === 'ios') {
      finalPartsRef.current = [texte];
    } else if (event.isFinal) {
      finalPartsRef.current = [...finalPartsRef.current, texte];
    }

    const complet = (
      event.isFinal || Platform.OS === 'ios'
        ? finalPartsRef.current
        : [...finalPartsRef.current, texte]
    )
      .join(' ')
      .trim();

    transcriptRef.current = complet;

    setTranscript(complet);
  });

  useSpeechRecognitionEvent('audioend', (event) => {
    const resoudre = audioEndRef.current;

    audioEndRef.current = null;

    resoudre?.(event.uri ?? null);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('Speech recognition error:', event.error, event.message);

    if (!recording || stoppingRef.current) return;

    stoppingRef.current = true;

    setRecording(false);
    setError(t('voiceError'));

    const resoudre = audioEndRef.current;

    audioEndRef.current = null;

    resoudre?.(null);
  });

  useEffect(() => {
    if (!recording) return;

    const timer = setInterval(() => {
      const ecoule = Date.now() - recordingStartedAt.current;

      setRecordingMs(ecoule);

      if (ecoule >= MAX_RECORDING_MS) stopRecording(true);
    }, 200);

    return () => clearInterval(timer);
  }, [recording]);

  async function startRecording() {
    let permission: { granted: boolean };

    try {
      permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    } catch (permissionError) {
      console.log('Microphone permission error:', permissionError);
      setError(t('voiceError'));
      return;
    }

    if (!permission.granted) {
      Alert.alert('', t('microphoneDenied'));
      return;
    }

    const langue = i18n.language?.startsWith('en') ? 'en-US' : 'fr-FR';

    let surAppareil = false;

    try {
      const { installedLocales } =
        await ExpoSpeechRecognitionModule.getSupportedLocales({});

      surAppareil = installedLocales.some((locale) =>
        locale.toLowerCase().startsWith(langue.slice(0, 2)),
      );
    } catch (localesError) {
      console.log('Supported locales error:', localesError);
    }

    try {
      finalPartsRef.current = [];
      transcriptRef.current = '';
      audioEndRef.current = null;

      setTranscript('');

      ExpoSpeechRecognitionModule.start({
        lang: langue,
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
        requiresOnDeviceRecognition: surAppareil,
        recordingOptions: {
          persist: true,
          outputSampleRate: 16000,
          outputEncoding: 'pcmFormatInt16',
        },
      });

      recordingStartedAt.current = Date.now();
      stoppingRef.current = false;

      setRecordingMs(0);
      setRecording(true);
    } catch (recordError) {
      console.log('Start recording error:', recordError);
      setError(t('voiceError'));
    }
  }

  function attendreFichier(): Promise<string | null> {
    return new Promise((resolve) => {
      audioEndRef.current = resolve;

      setTimeout(() => {
        if (audioEndRef.current !== resolve) return;

        audioEndRef.current = null;

        resolve(null);
      }, AUDIO_FILE_TIMEOUT_MS);
    });
  }

  async function stopRecording(envoyer: boolean) {
    if (stoppingRef.current) return;

    stoppingRef.current = true;

    const duree = Date.now() - recordingStartedAt.current;

    setRecording(false);

    if (!envoyer) {
      ExpoSpeechRecognitionModule.abort();
      return;
    }

    const attente = attendreFichier();

    ExpoSpeechRecognitionModule.stop();

    const uri = await attente;

    if (!uri) {
      setError(t('voiceError'));
      return;
    }

    if (duree < MIN_RECORDING_MS) {
      Alert.alert('', t('voiceTooShort'));
      return;
    }

    setUploading(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const message = await sendVoiceMessageApi(
        session.accessToken,
        chatId,
        uri,
        duree,
        transcriptRef.current,
      );

      setMessages((current) =>
        current.some((item) => item.id === message.id)
          ? current
          : [message, ...current],
      );

      setError(null);
    } catch (voiceError) {
      console.log('Send voice error:', voiceError);
      setError(t('voiceError'));
    } finally {
      setUploading(false);
    }
  }

  async function lancerRecherche(terme: string) {
    setSearchQuery(terme);

    if (terme.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      setSearchResults(
        await searchMessagesApi(session.accessToken, chatId, terme),
      );
    } catch (searchError) {
      console.log('Search messages error:', searchError);
    } finally {
      setSearching(false);
    }
  }

  function fermerRecherche() {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  function ouvrirActions(message: ChatMessages) {
    setActionsFor(message);
  }

  function repondreA(message: ChatMessages) {
    setActionsFor(null);
    setEditingId(null);
    setReplyTo(message);
  }

  function modifier(message: ChatMessages) {
    setActionsFor(null);
    setReplyTo(null);
    setEditingId(message.id);
    setDraft(message.content);
  }

  function confirmerSuppression(message: ChatMessages) {
    setActionsFor(null);

    Alert.alert(t('deleteMessageTitle'), t('deleteMessageConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteMessage'),
        style: 'destructive',
        onPress: () => supprimerMessage(message.id),
      },
    ]);
  }

  async function supprimerMessage(messageId: string) {
    setMessages((actuels) => actuels.filter((item) => item.id !== messageId));

    if (editingId === messageId) annulerEdition();

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await deleteMessageApi(session.accessToken, chatId, messageId);
    } catch (deleteError) {
      console.log('Delete message error:', deleteError);
      setError(t('deleteError'));
    }
  }

  function annulerEdition() {
    setEditingId(null);
    setDraft('');
  }

  async function enregistrerEdition() {
    const contenu = draft.trim();

    if (!editingId || !contenu || sending) return;

    setSending(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const modifie = await editMessageApi(
        session.accessToken,
        chatId,
        editingId,
        contenu,
      );

      setMessages((actuels) =>
        actuels.map((item) => (item.id === modifie.id ? modifie : item)),
      );

      annulerEdition();

      setError(null);
    } catch (editError) {
      console.log('Edit message error:', editError);
      setError(
        editError instanceof Error ? editError.message : t('sendError'),
      );
    } finally {
      setSending(false);
    }
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

  function avertirSejourANoter() {
    if (!sejourANoter) return false;

    Alert.alert(
      t('exchange:review.blockedTitle'),
      t('exchange:review.blockedText'),
      [
        { text: t('exchange:review.later'), style: 'cancel' },
        {
          text: t('exchange:review.rateNow'),
          onPress: () =>
            navigation.navigate('ReviewStay', {
              exchangeId: sejourANoter.exchangeId,
              homeTitle: sejourANoter.homeTitle,
              homePhotoUrl: sejourANoter.homePhotoUrl,
              partnerFirstName: sejourANoter.partnerFirstName,
            }),
        },
      ],
    );

    return true;
  }

  async function proposeExchange() {
    setMenuOpen(false);

    if (!participantId) return;

    if (avertirSejourANoter()) return;

    const session = await getSession();

    if (!session?.accessToken) return;

    try {
      const aimes = await fetchLikedHomesApi(
        session.accessToken,
        participantId,
      );

      const candidats = aimes.length
        ? aimes
        : (await getHomesByOwner(session.accessToken, participantId)).map(
            (home) => ({
              id: home.id,
              title: home.title,
              imageUrl: home.photos?.[0]?.url ?? null,
            }),
          );

      if (candidats.length === 0) {
        Alert.alert('', t('noHomeToExchange'));
        return;
      }

      if (candidats.length === 1) {
        navigation.navigate('ExchangeAvailability', {
          homeId: candidats[0].id,
        });
        return;
      }

      setLogementsAProposer(candidats);
    } catch (loadError) {
      console.log('Load participant homes error:', loadError);
      Alert.alert('', t('actionUnavailable'));
    }
  }

  function reportParticipant() {
    setMenuOpen(false);

    if (!participantId) return;

    setReportOpen(true);
  }

  async function envoyerSignalement(motif: string) {
    if (!participantId) return;

    setReporting(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await reportUserApi(
        session.accessToken,
        participantId,
        t(`reportReasons.${motif}`),
      );

      setReportOpen(false);

      Alert.alert('', t('reportedAndBlocked'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (reportError) {
      console.log('Report error:', reportError);
      Alert.alert('', t('reportError'));
    } finally {
      setReporting(false);
    }
  }

  const showTranslationNotice =
    translated && messages.some((message) => message.translatedContent);

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
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => ouvrirActions(message)}
            delayLongPress={300}
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
            {message.replyTo ? (
              <View
                style={[
                  styles.quote,
                  isMine ? styles.quoteMine : styles.quoteTheirs,
                ]}
              >
                <Text
                  style={[
                    styles.quoteAuthor,
                    isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                  ]}
                  numberOfLines={1}
                >
                  {message.replyTo.senderFirstName}
                </Text>

                <Text
                  style={[
                    styles.quoteText,
                    isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                  ]}
                  numberOfLines={1}
                >
                  {apercuMessage(message.replyTo)}
                </Text>
              </View>
            ) : null}

            {message.type === 'IMAGE' && message.attachmentUrl ? (
              <Image
                source={{ uri: resolveImageUrl(message.attachmentUrl) ?? '' }}
                style={styles.attachment}
                resizeMode="cover"
              />
            ) : message.type === 'AUDIO' && message.attachmentUrl ? (
              <VoiceMessageBubble
                uri={resolveImageUrl(message.attachmentUrl) ?? ''}
                durationMs={message.attachmentDurationMs}
                mine={isMine}
                transcript={
                  translated && message.translatedContent
                    ? message.translatedContent
                    : message.content
                }
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
              {message.editedAt ? ` · ${t('edited')}` : ''}
            </Text>
          </TouchableOpacity>
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
    <SafeAreaView style={styles.container} edges={['top']}>
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

          <View style={styles.headerText}>
            <Text style={styles.headerName} numberOfLines={1}>
              {participantName}
            </Text>

            {participantOnline ? (
              <Text style={styles.headerPresence}>{t('online')}</Text>
            ) : participantLastSeen ? (
              <Text style={styles.headerLastSeen}>
                {formatLastSeen(participantLastSeen, t)}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => setMenuOpen(true)}
        >
          <Info size={22} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <GuestHomeChoiceModal
        logements={logementsAProposer}
        titre={t('exchange:chooseStayTitle')}
        aide={t('exchange:chooseStayHint')}
        libelleValidation={t('exchange:chooseStayConfirm')}
        onFermer={() => setLogementsAProposer([])}
        onConfirmer={async (logementId) => {
          setLogementsAProposer([]);
          navigation.navigate('ExchangeAvailability', { homeId: logementId });
        }}
      />

      <GuestHomeChoiceModal
        logements={logementsCandidats}
        onFermer={() => setLogementsCandidats([])}
        onConfirmer={async (logementId) => {
          const session = await getSession();

          if (!session?.accessToken || !exchange) return;

          const accepte = await respondToExchangeApi(
            session.accessToken,
            exchange.id,
            'ACCEPT',
            logementId,
          );

          setLogementsCandidats([]);
          setExchange(accepte ?? null);
        }}
      />

      {exchange &&
      ['PENDING', 'FUTURE', 'CURRENT'].includes(exchange.status) ? (
        <ExchangeBanner
          exchange={exchange}
          onAccept={async () => {
            const session = await getSession();

            if (!session?.accessToken) return;

            const candidats = await fetchGuestHomesApi(
              session.accessToken,
              exchange.id,
            );

            if (candidats.length > 1) {
              setLogementsCandidats(candidats);
              return;
            }

            const accepte = await respondToExchangeApi(
              session.accessToken,
              exchange.id,
              'ACCEPT',
            );

            setExchange(accepte ?? null);
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
          behavior="padding"
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
            ListHeaderComponent={participantTyping ? <TypingBubble /> : null}
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
            {replyTo ? (
              <View style={styles.editingBar}>
                <View style={styles.replyPreview}>
                  <Text style={styles.replyAuthor} numberOfLines={1}>
                    {replyTo.senderId === currentUserId
                      ? t('replyToYou')
                      : participantName}
                  </Text>

                  <Text style={styles.replyExtract} numberOfLines={1}>
                    {apercuMessage(replyTo)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setReplyTo(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editingCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {editingId ? (
              <View style={styles.editingBar}>
                <Text style={styles.editingLabel} numberOfLines={1}>
                  {t('editingMessage')}
                </Text>

                <TouchableOpacity onPress={annulerEdition} activeOpacity={0.7}>
                  <Text style={styles.editingCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {showTranslationNotice ? (
              <Text style={styles.translationNotice}>
                {t('autoTranslated')}{' '}
                <Text
                  style={styles.translationLink}
                  onPress={() => applyTranslation(false)}
                >
                  {t('removeTranslation')}
                </Text>
              </Text>
            ) : null}

            <View style={styles.composerCard}>
              {recording ? (
                <View>
                  {transcript ? (
                    <Text style={styles.recordTranscript} numberOfLines={2}>
                      {transcript}
                    </Text>
                  ) : null}

                  <View style={styles.composerRow}>
                  <View style={styles.recordDot} />

                  <Text style={styles.recordTimer}>
                    {formatRecordingTime(recordingMs)}
                  </Text>

                  <TouchableOpacity
                    style={styles.recordCancel}
                    onPress={() => stopRecording(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.recordCancelText}>{t('cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => stopRecording(true)}
                    disabled={uploading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#2DA7F3', '#52D1A6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sendButton}
                    >
                      {uploading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Send size={19} color="#FFFFFF" />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  </View>
                </View>
              ) : (
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
                  onChangeText={handleDraftChange}
                  placeholder={t('messagePlaceholder')}
                  placeholderTextColor={themeColors.textFaint}
                  multiline
                />

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={startRecording}
                  disabled={uploading}
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
                  onPress={editingId ? enregistrerEdition : handleSend}
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
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
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

            {showTranslationNotice || !translated ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleTranslation}
              >
                <Text style={styles.menuText}>
                  {translated ? t('stopTranslation') : t('restoreTranslation')}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Text style={styles.menuText}>{t('searchMessages')}</Text>
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

      <Modal
        visible={actionsFor !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setActionsFor(null)}
      >
        <View style={styles.actionsBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActionsFor(null)}
          />

          <View style={styles.actionsCard}>
            {actionsFor ? (
              <>
                <View style={styles.actionsHeader}>
                  <Text style={styles.actionsExtract} numberOfLines={2}>
                    {apercuMessage(actionsFor)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.actionsRow}
                  activeOpacity={0.6}
                  onPress={() => repondreA(actionsFor)}
                >
                  <Text style={styles.actionsIcon}>↩</Text>
                  <Text style={styles.actionsLabel}>{t('replyMessage')}</Text>
                </TouchableOpacity>

                {actionsFor.senderId === currentUserId &&
                actionsFor.type === 'TEXT' ? (
                  <TouchableOpacity
                    style={styles.actionsRow}
                    activeOpacity={0.6}
                    onPress={() => modifier(actionsFor)}
                  >
                    <Text style={styles.actionsIcon}>✎</Text>
                    <Text style={styles.actionsLabel}>{t('editMessage')}</Text>
                  </TouchableOpacity>
                ) : null}

                {actionsFor.senderId === currentUserId ? (
                  <TouchableOpacity
                    style={styles.actionsRow}
                    activeOpacity={0.6}
                    onPress={() => confirmerSuppression(actionsFor)}
                  >
                    <Text style={[styles.actionsIcon, styles.actionsDanger]}>
                      ⌫
                    </Text>
                    <Text style={[styles.actionsLabel, styles.actionsDanger]}>
                      {t('deleteMessage')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.actionsRow, styles.actionsCancelRow]}
              activeOpacity={0.6}
              onPress={() => setActionsFor(null)}
            >
              <Text style={styles.actionsCancel}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={searchOpen}
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={fermerRecherche}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.searchHeader}>
            <BackButton onPress={fermerRecherche} style={styles.headerButton} />

            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={lancerRecherche}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={themeColors.textFaint}
              autoFocus
            />
          </View>

          {searching ? (
            <ActivityIndicator
              style={styles.searchLoader}
              color={themeColors.primary}
            />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(message) => message.id}
              contentContainerStyle={styles.searchList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                searchQuery.trim().length >= 2 ? (
                  <Text style={styles.searchEmpty}>{t('searchNoResult')}</Text>
                ) : null
              }
              renderItem={({ item }) => (
                <View style={styles.searchRow}>
                  <Text style={styles.searchAuthor}>
                    {item.senderId === currentUserId
                      ? t('replyToYou')
                      : participantName}
                    {' · '}
                    {formatMessageDay(item.createdAt, t)}
                  </Text>

                  <Text style={styles.searchExtract} numberOfLines={2}>
                    {apercuMessage(item)}
                  </Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
      <Modal
        visible={reportOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setReportOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setReportOpen(false)}
        >
          <View style={[styles.menuSheet, { paddingBottom: 20 + insets.bottom }]}>
            <Text style={styles.reportTitle}>{t('reportTitle')}</Text>

            {REPORT_REASONS.map((motif) => (
              <TouchableOpacity
                key={motif}
                style={styles.menuItem}
                disabled={reporting}
                onPress={() => envoyerSignalement(motif)}
              >
                <Text style={styles.menuText}>
                  {t(`reportReasons.${motif}`)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setReportOpen(false)}
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

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },

  searchInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 21,
    backgroundColor: c.surfaceAlt,
    fontSize: 15,
    color: c.text,
  },

  searchLoader: {
    marginTop: 32,
  },

  searchList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  searchRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },

  searchAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textMuted,
  },

  searchExtract: {
    marginTop: 3,
    fontSize: 14,
    color: c.text,
  },

  searchEmpty: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 14,
    color: c.textMuted,
  },

  actionsBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 36,
    backgroundColor: c.overlay,
  },

  actionsCard: {
    borderRadius: 20,
    backgroundColor: c.surface,
    overflow: 'hidden',
  },

  actionsHeader: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },

  actionsExtract: {
    fontSize: 13,
    fontStyle: 'italic',
    color: c.textMuted,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },

  actionsIcon: {
    width: 20,
    fontSize: 16,
    textAlign: 'center',
    color: c.text,
  },

  actionsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
  },

  actionsDanger: {
    color: c.danger,
  },

  actionsCancelRow: {
    justifyContent: 'center',
  },

  actionsCancel: {
    fontSize: 15,
    fontWeight: '700',
    color: c.textMuted,
  },

  reportTitle: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: '800',
    color: c.text,
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

  headerText: {
    flex: 1,
  },

  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: c.text,
  },

  headerPresence: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '600',
    color: c.success,
  },

  headerLastSeen: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '600',
    color: c.textMuted,
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
    backgroundColor: c.bubbleMine,
  },

  bubbleTheirs: {
    backgroundColor: c.bubbleTheirs,
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
    color: c.onBubbleMine,
  },

  bubbleTextTheirs: {
    color: c.onBubbleTheirs,
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

  editingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 8,
  },

  replyPreview: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: c.primary,
    paddingLeft: 8,
  },

  replyAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: c.primary,
  },

  replyExtract: {
    fontSize: 12,
    color: c.textMuted,
  },

  quote: {
    marginBottom: 6,
    paddingLeft: 8,
    paddingVertical: 2,
    borderLeftWidth: 3,
    borderRadius: 2,
  },

  quoteMine: {
    borderLeftColor: 'rgba(255,255,255,0.6)',
  },

  quoteTheirs: {
    borderLeftColor: c.primary,
  },

  quoteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.9,
  },

  quoteText: {
    fontSize: 12,
    opacity: 0.75,
  },

  editingLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: c.textMuted,
  },

  editingCancel: {
    fontSize: 12,
    fontWeight: '700',
    color: c.primary,
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

  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    backgroundColor: c.danger,
  },

  recordTimer: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
    fontVariant: ['tabular-nums'],
  },

  recordCancel: {
    height: 42,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },

  recordCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.textMuted,
  },

  recordTranscript: {
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontSize: 13,
    color: c.textMuted,
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
