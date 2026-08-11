export type TranslationResult = {
  content: string;
  detectedSourceLocale: string;
};

export interface TranslatorPort {
  isEnabled(): boolean;
  translate(texts: string[], targetLocale: string): Promise<TranslationResult[]>;
}
