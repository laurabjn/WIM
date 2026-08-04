import type { ChatMessages } from './message.type';

export type ChatParticipantUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type ChatParticipant = {
  id: string;
  chatId: string;
  userId: string;
  lastReadMessageId: string | null;
  joinedAt: string;

  user: ChatParticipantUser;
};

export type ChatListItem = {
  id: string;
  matchId: string;

  participant: ChatParticipantUser;

  lastMessage: ChatMessages | null;

  unreadCount: number;

  createdAt: string;
  updatedAt: string;
};

export type ChatDetails = {
  id: string;
  matchId: string;

  participants: ChatParticipant[];

  createdAt: string;
  updatedAt: string;
};

export type UnreadMessagesCount = {
  count: number;
};

export type ChatUpdatedSocketPayload = {
  chatId: string;
  lastMessage: ChatMessages;
  unreadCount?: number;
};

export type UnreadCountUpdatedSocketPayload = {
  count: number;
};