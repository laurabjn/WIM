import { ChatMessage } from "./chat.repository"


export type CreateMessageData = {
  chatId: string
  senderId: string
  content: string
  type?: 'TEXT' | 'IMAGE'
  attachmentUrl?: string | null
}

export type FindMessagesOptions = {
  chatId: string
  cursor?: string
  limit: number
}

export type FindMessagesResult = {
  messages: ChatMessage[]
  hasMore: boolean
  nextCursor: string | null
}

export interface MessageRepository {
  create(data: CreateMessageData): Promise<ChatMessage>
  findById(messageId: string): Promise<ChatMessage | null>
  findChatMessages(options: FindMessagesOptions): Promise<FindMessagesResult>
  findLastMessage(chatId: string): Promise<ChatMessage | null>
}