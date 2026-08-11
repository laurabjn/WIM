import type { ChatMessages } from '@wim/shared';
import type { ChatMessage } from '../../domain/auth/repositories/chat.repository';

export function mapMessage(message: ChatMessage): ChatMessages {
  return {
    id: message.id,
    chatId: message.chatId,
    senderId: message.senderId,
    content: message.content,
    type: message.type,
    attachmentUrl: message.attachmentUrl,
    sender: {
      id: message.sender.id,
      firstName: message.sender.firstName,
      lastName: message.sender.lastName,
      avatarUrl: message.sender.avatarUrl,
    },
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}