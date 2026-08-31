export type MessageSender = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
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
  attachmentDurationMs?: number | null;
  translatedContent?: string | null;
  editedAt?: string | null;
  replyTo?: {
    id: string;
    content: string;
    type: MessageKind;
    senderId: string;
    senderFirstName: string;
  } | null;
  sender: MessageSender;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessagesPage = {
  messages: ChatMessages[];
  nextCursor: string | null;
  hasMore: boolean;
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