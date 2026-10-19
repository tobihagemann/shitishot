import type { Language } from '../lib/language.js';

/** A title as it appears in Wikimedia URL paths: spaces become underscores, then the whole title is URI-component encoded. */
export function articlePath(title: string): string {
  return encodeURIComponent(title.replaceAll(' ', '_'));
}

export function articleUrl(title: string, lang: Language): string {
  return `https://${lang}.wikipedia.org/wiki/${articlePath(title)}`;
}
