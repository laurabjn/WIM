export const LANGUAGES_OPTIONS = [
  'english',
  'french'
] as const;

export type LanguageOption = typeof LANGUAGES_OPTIONS[number];