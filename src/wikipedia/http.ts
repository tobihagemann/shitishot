import type { Language } from '../lib/language.js';

export class WikipediaError extends Error {
  override name = 'WikipediaError';
}

const REST_BASE = 'https://wikimedia.org/api/rest_v1';
const TIMEOUT_MS = 8000;

/** Resolves to null on 404, which these endpoints use for "no data". */
export async function fetchRest<T>(path: string): Promise<T | null> {
  return getJson<T>(`${REST_BASE}${path}`);
}

/** Throws WikipediaError when the body carries an `error`, which the action API sends with HTTP 200. */
export async function fetchQuery<T>(lang: Language, params: Record<string, string>): Promise<T> {
  const search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', origin: '*', ...params });
  const body = await getJson<T & { error?: { info?: string } }>(`https://${lang}.wikipedia.org/w/api.php?${search}`);
  if (!body || body.error) {
    throw new WikipediaError(body?.error?.info ?? 'Empty action API response');
  }
  return body;
}

// Requests stay plain GETs without custom headers, so they remain simple CORS requests. The REST host answers
// preflights with 405, so a header such as Api-User-Agent would block the request.
async function getJson<T>(url: string): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (cause) {
    throw new WikipediaError(`Request failed: ${url}`, { cause });
  }
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new WikipediaError(`HTTP ${response.status}: ${url}`);
  }
  return (await response.json()) as T;
}
