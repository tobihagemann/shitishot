import { watchEffect } from 'vue';
import { i18n } from '../i18n.js';
import { isLanguage, type Language } from '../lib/language.js';
import { isTitlesSource, type TitlesSource } from '../wikipedia/titles.js';
import { useStoredJson } from './useStorage.js';

function detectLanguage(): Language {
  const preferred = navigator.languages?.[0] ?? navigator.language ?? '';
  return preferred.toLowerCase().startsWith('de') ? 'de' : 'en';
}

const language = useStoredJson<Language>('shitishot:language', detectLanguage(), isLanguage);
const titlesSource = useStoredJson<TitlesSource>('shitishot:titlesSource', 'mostViewed', isTitlesSource);

watchEffect(() => {
  i18n.global.locale.value = language.value;
  document.documentElement.lang = language.value;
  document.title = i18n.global.t('app.title');
});

export function useSettings() {
  return { language, titlesSource };
}
