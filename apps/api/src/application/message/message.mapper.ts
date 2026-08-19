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
    attachmentDurationMs: message.attachmentDurationMs,
    editedAt: message.editedAt ? message.editedAt.toISOString() : null,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          content: message.replyTo.content,
          type: message.replyTo.type,
          senderId: message.replyTo.senderId,
          senderFirstName: message.replyTo.sender.firstName,
        }
      : null,
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