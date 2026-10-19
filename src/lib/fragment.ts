import { isLanguage, type Language } from './language.js';

export interface ParsedFragment {
  titles?: string[];
  lang?: Language;
  /** Raw title components whose percent-encoding is malformed. */
  invalid: string[];
}

/**
 * Parses a share fragment (`#t=<titles>&l=<lang>`). The title list is split on raw commas before each title is
 * decoded, so an encoded comma (%2C) inside a title survives. Callers must therefore pass the raw
 * `window.location.hash`. Unknown keys, such as the 2018 search-engine `s`, are ignored. Never throws.
 */
export function parseFragment(rawHash: string): ParsedFragment {
  const result: ParsedFragment = { invalid: [] };
  const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
  for (const pair of hash.split('&')) {
    const separator = pair.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    if (key === 't') {
      const titles: string[] = [];
      for (const component of value.split(',')) {
        const title = safeDecode(component)?.trim();
        if (title === undefined) {
          result.invalid.push(component);
        } else if (title !== '') {
          titles.push(title);
        }
      }
      if (titles.length > 0) {
        result.titles = titles;
      }
    } else if (key === 'l') {
      const lang = safeDecode(value);
      if (isLanguage(lang)) {
        result.lang = lang;
      }
    }
  }
  return result;
}

function safeDecode(component: string): string | undefined {
  try {
    return decodeURIComponent(component);
  } catch {
    return undefined;
  }
}

export function buildFragment(titles: readonly string[], lang?: Language): string {
  const fragment = `t=${titles.map((title) => encodeURIComponent(title)).join(',')}`;
  return lang ? `${fragment}&l=${lang}` : fragment;
}

export function buildShareUrl(origin: string, titles: readonly string[], lang: Language): string {
  return `${origin}/#${buildFragment(titles, lang)}`;
}
