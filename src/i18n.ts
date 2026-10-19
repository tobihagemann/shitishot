import { createI18n } from 'vue-i18n';
import type { Language } from './lib/language.js';
import { de, type MessageSchema } from './locales/de.js';
import { en } from './locales/en.js';

const integer = { style: 'decimal', useGrouping: true, maximumFractionDigits: 0 } as const;

export const i18n = createI18n<[MessageSchema], Language, false>({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  messages: { de, en },
  numberFormats: { de: { integer }, en: { integer } },
});
