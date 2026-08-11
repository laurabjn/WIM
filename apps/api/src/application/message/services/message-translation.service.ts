import { Inject, Injectable } from '@nestjs/common';
import type { ChatMessages } from '@wim/shared';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { TRANSLATOR } from 'src/interfaces/http/tokens/token';
import type { TranslatorPort } from '../ports/translator.port';

@Injectable()
export class MessageTranslationService {
  constructor(
    @Inject(TRANSLATOR)
    private readonly translator: TranslatorPort,
    private readonly prisma: PrismaService,
  ) {}

  isEnabled(): boolean {
    return this.translator.isEnabled();
  }

  async translate(
    messages: ChatMessages[],
    readerId: string,
  ): Promise<ChatMessages[]> {
    if (!this.translator.isEnabled()) return messages;

    const reader = await this.prisma.user.findUnique({
      where: { id: readerId },
      select: { preferredLocale: true },
    });

    const targetLocale = reader?.preferredLocale ?? 'fr';

    const translatable = messages.filter(
      (message) =>
        message.type === 'TEXT' &&
        message.senderId !== readerId &&
        message.content.trim().length > 0,
    );

    if (translatable.length === 0) return messages;

    const cached = await this.prisma.messageTranslation.findMany({
      where: {
        messageId: { in: translatable.map((message) => message.id) },
        locale: targetLocale,
      },
    });

    const byMessageId = new Map(
      cached.map((row) => [row.messageId, row.content]),
    );

    const missing = translatable.filter(
      (message) => !byMessageId.has(message.id),
    );

    if (missing.length > 0) {
      const results = await this.translator.translate(
        missing.map((message) => message.content),
        targetLocale,
      );

      const rows = missing
        .map((message, index) => ({ message, result: results[index] }))
        .filter((pair) => pair.result !== undefined)
        .map((pair) => ({
          messageId: pair.message.id,
          locale: targetLocale,
          // Un message deja dans la langue du lecteur est memorise tel quel :
          // sans cela, DeepL serait rappele a chaque ouverture de la discussion.
          content:
            pair.result.detectedSourceLocale === targetLocale.split('-')[0]
              ? pair.message.content
              : pair.result.content,
        }));

      if (rows.length > 0) {
        await this.prisma.messageTranslation.createMany({
          data: rows,
          skipDuplicates: true,
        });

        for (const row of rows) {
          byMessageId.set(row.messageId, row.content);
        }
      }
    }

    return messages.map((message) => {
      const translation = byMessageId.get(message.id);

      return translation && translation !== message.content
        ? { ...message, translatedContent: translation }
        : message;
    });
  }
}
