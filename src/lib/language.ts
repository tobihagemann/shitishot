export type Language = 'de' | 'en';

export function isLanguage(value: unknown): value is Language {
  return value === 'de' || value === 'en';
}
