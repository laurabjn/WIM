export type MessageSender = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type ChatMessages = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  sender: MessageSender;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessagesPage = {
  messages: ChatMessages[];
  nextCursor: string | null;
  hasMore: boolean;
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