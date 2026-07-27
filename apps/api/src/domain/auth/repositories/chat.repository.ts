export type ChatUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export type ChatListItem = {
  id: string;
  matchId: string;
  createdAt: Date;
  updatedAt: Date;

  participants: {
    user: ChatUser;
  }[];

  messages: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  }[];
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;

  sender: ChatUser;
};

export interface ChatRepository {
  findByUserId(
    userId: string,
  ): Promise<ChatListItem[]>;

  findMessages(
    chatId: string,
    userId: string,
  ): Promise<ChatMessage[]>;

  createMessage(input: {
    chatId: string;
    senderId: string;
    content: string;
  }): Promise<ChatMessage>;

  isParticipant(
    chatId: string,
    userId: string,
  ): Promise<boolean>;
}