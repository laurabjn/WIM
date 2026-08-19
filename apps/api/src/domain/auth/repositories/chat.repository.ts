export type ChatUser = {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  // Statut brut : c'est la couche application qui decide s'il est perime.
  statusText?: string | null
  statusUpdatedAt?: Date | null
}

export type ChatParticipant = {
  hiddenAt?: Date | null
  id: string
  chatId: string
  userId: string
  lastReadMessageId: string | null
  joinedAt: Date
  user: ChatUser
}

export type MessageKind = 'TEXT' | 'IMAGE' | 'AUDIO'

export type ChatMessage = {
  id: string
  chatId: string
  senderId: string
  content: string
  type: MessageKind
  attachmentUrl: string | null
  attachmentDurationMs: number | null
  editedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  sender: ChatUser
}

export type Chat = {
  id: string
  matchId: string
  createdAt: Date
  updatedAt: Date
  participants: ChatParticipant[]
  messages: ChatMessage[]
}

export type ChatListItem = {
  id: string
  matchId: string
  createdAt: Date
  updatedAt: Date
  participants: ChatParticipant[]
  messages: ChatMessage[]
}

export interface ChatRepository {
  findByUserId(userId: string,): Promise<ChatListItem[]>
  findById(chatId: string,): Promise<Chat>
  findMessages(chatId: string, userId: string,): Promise<ChatMessage[]>
  findParticipant(chatId: string,userId: string): Promise<ChatParticipant | null>;
  findMyChats(userId: string): Promise<ChatListItem[]>
  updateLastReadMessage(chatId: string, userId: string, lastReadMessageId: string | null): Promise<void>
  countUnreadMessages(chatId: string, userId: string): Promise<number>
  countAllUnreadMessages(userId: string): Promise<number>
  touchChat(chatId: string): Promise<void>
  createMessage(input: {chatId: string, senderId: string, content: string, type?: MessageKind, attachmentUrl?: string | null, attachmentDurationMs?: number | null}): Promise<ChatMessage>;
  isParticipant(chatId: string, userId: string): Promise<boolean>
  hasUserReplied(chatId: string, userId: string): Promise<boolean>
}