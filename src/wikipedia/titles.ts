import { daysBefore, formatUtcDate } from '../lib/dates.js';
import type { Language } from '../lib/language.js';
import { shuffle } from '../lib/shuffle.js';
import { fetchQuery, fetchRest, WikipediaError } from './http.js';

export type TitlesSource = 'mostViewed' | 'random';

export function isTitlesSource(value: unknown): value is TitlesSource {
  return value === 'mostViewed' || value === 'random';
}

interface TopResponse {
  items?: { articles?: { article: string }[] }[];
}

interface RandomResponse {
  query?: { random?: { title: string }[] };
}

/**
 * Raw candidate titles for a new game, fetched fresh on every call. Callers resolve them, which also rejects
 * non-articles such as `Wikipedia:Hauptseite` or `Spezial:Suche` from the most-viewed list.
 */
export async function getCandidateTitles(source: TitlesSource, lang: Language): Promise<string[]> {
  return source === 'random' ? getRandomTitles(lang) : getMostViewedTitles(lang);
}

// The newest daily top list is published with a lag, so walk back from yesterday until one exists.
async function getMostViewedTitles(lang: Language): Promise<string[]> {
  const now = new Date();
  for (let days = 1; days <= 7; days++) {
    const body = await fetchRest<TopResponse>(`/metrics/pageviews/top/${lang}.wikipedia/all-access/${formatUtcDate(daysBefore(now, days), '/')}`);
    if (body) {
      const articles = body.items?.[0]?.articles ?? [];
      // enwiki's Main Page is a main-namespace article, so resolution would not reject it.
      return shuffle(articles.map(({ article }) => article.replaceAll('_', ' ')).filter((title) => title !== 'Main Page'));
    }
  }
  throw new WikipediaError(`No most-viewed list for ${lang}`);
}

async function getRandomTitles(lang: Language): Promise<string[]> {
  const body = await fetchQuery<RandomResponse>(lang, { list: 'random', rnnamespace: '0', rnlimit: '20' });
  return body.query?.random?.map(({ title }) => title) ?? [];
}
