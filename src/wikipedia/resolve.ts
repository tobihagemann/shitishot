import type { Language } from '../lib/language.js';
import { fetchQuery } from './http.js';

/** An `ok` result always names a main-namespace (ns 0) article, whichever lookup produced it. */
export type Resolution = { term: string; status: 'ok'; title: string } | { term: string; status: 'missing' };

interface TitlesResponse {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: { title: string; ns?: number; missing?: boolean; invalid?: boolean }[];
  };
}

interface SearchResponse {
  query?: { search?: { title: string; ns: number }[] };
}

/**
 * Resolves terms to article titles with one batched exact-title query, following normalization and redirects.
 * With `search`, each term left unresolved falls back to its top search hit. Callers pass at most 50 terms.
 */
export async function resolveTerms(terms: readonly string[], lang: Language, { search }: { search: boolean }): Promise<Resolution[]> {
  const body = await fetchQuery<TitlesResponse>(lang, { titles: terms.join('|'), redirects: '1' });
  const normalized = new Map(body.query?.normalized?.map(({ from, to }) => [from, to]));
  const redirects = new Map(body.query?.redirects?.map(({ from, to }) => [from, to]));
  const articles = new Set(body.query?.pages?.filter((page) => page.ns === 0 && !page.missing && !page.invalid).map((page) => page.title));

  return Promise.all(
    terms.map(async (term): Promise<Resolution> => {
      let title = normalized.get(term) ?? term;
      for (let hops = 0; redirects.has(title) && hops < 5; hops++) {
        title = redirects.get(title)!;
      }
      if (articles.has(title)) {
        return { term, status: 'ok', title };
      }
      if (search) {
        // A hit can itself be a redirect (e.g. via the onlyredirects: keyword), so resolve it like an exact title.
        const hit = await searchArticle(term, lang);
        const [resolved] = hit ? await resolveTerms([hit], lang, { search: false }) : [];
        if (resolved?.status === 'ok') {
          return { term, status: 'ok', title: resolved.title };
        }
      }
      return { term, status: 'missing' };
    }),
  );
}

// A namespace prefix in the term overrides srnamespace=0, so the hit's own namespace is checked too.
async function searchArticle(term: string, lang: Language): Promise<string | null> {
  const body = await fetchQuery<SearchResponse>(lang, { list: 'search', srsearch: term, srnamespace: '0', srlimit: '1' });
  const hit = body.query?.search?.[0];
  return hit?.ns === 0 ? hit.title : null;
}
