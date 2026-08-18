export type MessageSender = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  /** Statut court du moment, null passe un jour. */
  status?: string | null;
};

export type MessageKind = 'TEXT' | 'IMAGE' | 'AUDIO';

export type ChatMessages = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageKind;
  attachmentUrl: string | null;
  // Renseignee pour les vocaux uniquement : la bulle affiche la duree sans
  // avoir a charger l'enregistrement.
  attachmentDurationMs?: number | null;
  translatedContent?: string | null;
  sender: MessageSender;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessagesPage = {
  messages: ChatMessages[];
  nextCursor: string | null;
  hasMore: boolean;
  // Date du dernier message lu par l'autre participant : elle seule permet de
  // dire "Vu" avec justesse, plutot que de l'afficher des l'envoi.
  participantLastReadAt: string | null;
};

export type SendMessagePayload = {
  content: string;
};

export type SendMessageResult = {
  message: ChatMessages;
};

export type MessageCreatedSocketPayload = {
  chatId: string;
  message: ChatMessages;
};

export type MessagesReadSocketPayload = {
  chatId: string;
  userId: string;
  lastReadMessageId: string | null;
  readAt: string;
};

export type MyChatListItem = {
  id: string;
  matchId: string | null;
  participant: MessageSender;
  lastMessage: ChatMessages | null;
  unreadCount: number;
  isRequest: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MyRequestListItem = MyChatListItem & {
  relevanceScore: number;
};