import { thirtyDayRange } from '../lib/dates.js';
import type { Language } from '../lib/language.js';
import { roundToSignificant } from '../lib/numbers.js';
import { articlePath } from './articles.js';
import { fetchRest } from './http.js';

interface PerArticleResponse {
  items?: { views: number }[];
}

/**
 * Each title's user pageviews over the same fixed 30-day window, rounded to 3 significant digits. Days absent
 * from the response count as 0, and a 404 means no views. Every card shares the window, so a day not yet
 * published lowers every total alike and the ranking stays fair.
 */
export async function getThirtyDayViews(titles: readonly string[], lang: Language): Promise<number[]> {
  const { start, end } = thirtyDayRange(new Date());
  return Promise.all(
    titles.map(async (title) => {
      const body = await fetchRest<PerArticleResponse>(
        `/metrics/pageviews/per-article/${lang}.wikipedia/all-access/user/${articlePath(title)}/daily/${start}/${end}`,
      );
      const total = body?.items?.reduce((sum, item) => sum + item.views, 0) ?? 0;
      return roundToSignificant(total, 3);
    }),
  );
}
