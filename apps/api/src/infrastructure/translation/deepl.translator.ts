import { Injectable, Logger } from '@nestjs/common';
import type {
  TranslationResult,
  TranslatorPort,
} from 'src/application/message/ports/translator.port';

const MAX_TEXTS_PER_CALL = 50;

@Injectable()
export class DeeplTranslator implements TranslatorPort {
  private readonly logger = new Logger(DeeplTranslator.name);
  private readonly apiKey = process.env.DEEPL_API_KEY?.trim() ?? '';

  isEnabled(): boolean {
    return this.apiKey.length > 0;
  }

  private get endpoint(): string {
    const override = process.env.DEEPL_API_URL?.trim();

    if (override) return override;

    // Les cles de l'offre gratuite se terminent par `:fx` et ne sont acceptees
    // que par le domaine `api-free`, l'autre repondant 403.
    const host = this.apiKey.endsWith(':fx')
      ? 'api-free.deepl.com'
      : 'api.deepl.com';

    return `https://${host}/v2/translate`;
  }

  async translate(
    texts: string[],
    targetLocale: string,
  ): Promise<TranslationResult[]> {
    if (!this.isEnabled() || texts.length === 0) return [];

    const results: TranslationResult[] = [];

    for (let index = 0; index < texts.length; index += MAX_TEXTS_PER_CALL) {
      const batch = texts.slice(index, index + MAX_TEXTS_PER_CALL);

      results.push(...(await this.translateBatch(batch, targetLocale)));
    }

    return results;
  }

  private async translateBatch(
    texts: string[],
    targetLocale: string,
  ): Promise<TranslationResult[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: texts,
          target_lang: this.toDeeplLocale(targetLocale),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(
          `DeepL a repondu ${response.status} : traduction ignoree.`,
        );

        return [];
      }

      const payload = (await response.json()) as {
        translations?: Array<{
          text: string;
          detected_source_language: string;
        }>;
      };

      return (payload.translations ?? []).map((translation) => ({
        content: translation.text,
        detectedSourceLocale: translation.detected_source_language.toLowerCase(),
      }));
    } catch (error) {
      this.logger.warn(`Traduction indisponible : ${String(error)}`);

      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  private toDeeplLocale(locale: string): string {
    const normalized = locale.split('-')[0].toUpperCase();

    return normalized === 'EN' ? 'EN-GB' : normalized;
  }
}
