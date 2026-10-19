import { test as base, expect, type BrowserContext, type Locator, type Page, type Route } from '@playwright/test';

// Main-namespace articles and their 30-day views. Hund's count is unrounded, so its footer shows the 3-digit rounding.
export const VIEWS: Record<string, number> = {
  Hauskatze: 343_000,
  Hund: 95_149,
  Tunnel: 18_400,
  'Angela Merkel': 1_200_000,
  Berlin: 512_000,
  Kartoffelsalat: 4_560,
  'Neatsville, Kentucky': 123,
  Schindhaubasistunnel: 1_230,
  'Helene Fischer': 77_700,
  Deutschland: 2_340_000,
  Fußball: 230_000,
  'Main Page': 9_990_000,
};
// An article without pageview data: its per-article request answers 404, as Wikimedia does.
const WITHOUT_VIEWS = 'Leerartikel';
const REDIRECTS: Record<string, string> = { Katze: 'Hauskatze' };
const NAMESPACED: Record<string, number> = { 'Wikipedia:Hauptseite': 4, 'Spezial:Suche': -1, 'Datei:Foo.png': 6, 'Kategorie:Maler': 14 };
const SEARCH: Record<string, { title: string; ns: number }> = {
  Kartoffelsalt: { title: 'Kartoffelsalat', ns: 0 },
  'Kategorie:Maler': { title: 'Kategorie:Maler', ns: 14 },
  'onlyredirects:Katze': { title: 'Katze', ns: 0 },
};
// Non-articles and enwiki's Main Page first, as on the real de/en lists; the app must never deal them. Padded past the action API's 50-title
// limit, as the real ~1000-entry lists are.
const TOP_LIST = [
  'Wikipedia:Hauptseite',
  'Spezial:Suche',
  'Datei:Foo.png',
  'Main_Page',
  'Angela_Merkel',
  'Berlin',
  'Deutschland',
  'Fußball',
  'Helene_Fischer',
  'Schindhaubasistunnel',
  ...Array.from({ length: 50 }, (_, index) => `Rauschen_${index + 1}`),
];
// Like Wikimedia, a day's top list is published only once three days have passed since that day began.
const TOP_LAG_DAYS = 3;
const MAX_TITLES = 50;

const CORS = { 'access-control-allow-origin': '*' };

interface TopResponse {
  list: string[];
  delayMs?: number;
}

/** Stands in for every Wikimedia endpoint the app calls, so specs run offline and deterministically. */
export class WikiStub {
  views: Record<string, number> = { ...VIEWS };
  /** Answers for the next top-list requests, in order; afterwards `topList`. */
  topQueue: TopResponse[] = [];
  topList = TOP_LIST;
  /** Delays the action-API title lookup of a term, in ms. */
  lookupDelays: Record<string, number> = {};
  failing = false;

  async install(context: BrowserContext): Promise<void> {
    await context.route('**/w/api.php**', (route) => this.handleAction(route));
    await context.route('https://wikimedia.org/api/rest_v1/**', (route) => this.handleRest(route));
  }

  private async handleAction(route: Route): Promise<void> {
    if (await this.handleSpecial(route)) {
      return;
    }
    const params = new URL(route.request().url()).searchParams;
    if (params.get('list') === 'search') {
      const hit = SEARCH[params.get('srsearch') ?? ''];
      return json(route, { query: { search: hit ? [hit] : [] } });
    }
    if (params.get('list') === 'random') {
      return json(route, { query: { random: Object.keys(VIEWS).map((title) => ({ title })) } });
    }
    const terms = (params.get('titles') ?? '').split('|');
    if (terms.length > MAX_TITLES) {
      return json(route, { error: { code: 'toomanyvalues', info: `Too many values supplied for parameter "titles". The limit is ${MAX_TITLES}.` } });
    }
    const delay = Math.max(0, ...terms.map((term) => this.lookupDelays[term] ?? 0));
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return json(route, lookup(terms));
  }

  private async handleRest(route: Route): Promise<void> {
    if (await this.handleSpecial(route)) {
      return;
    }
    const path = new URL(route.request().url()).pathname;
    const top = path.match(/\/metrics\/pageviews\/top\/[^/]+\/all-access\/(\d{4})\/(\d{2})\/(\d{2})$/);
    if (top) {
      const published = Date.now() - Date.UTC(Number(top[1]), Number(top[2]) - 1, Number(top[3])) > TOP_LAG_DAYS * 24 * 60 * 60 * 1000;
      if (!published) {
        return json(route, { type: 'not_found' }, 404);
      }
      const next = this.topQueue.shift() ?? { list: this.topList };
      if (next.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, next.delayMs));
      }
      return json(route, { items: [{ articles: next.list.map((article, index) => ({ article, rank: index + 1 })) }] });
    }
    const match = path.match(/\/per-article\/[^/]+\/all-access\/user\/([^/]+)\/daily\//);
    const title = match ? decodeURIComponent(match[1]!).replaceAll('_', ' ') : '';
    const total = this.views[title];
    if (total === undefined) {
      return json(route, { type: 'not_found' }, 404);
    }
    // Split over two days to exercise the summing.
    const first = Math.floor(total / 2);
    return json(route, { items: [{ views: first }, { views: total - first }] });
  }

  private async handleSpecial(route: Route): Promise<boolean> {
    // The REST host refuses CORS preflights, but routed requests skip the preflight, so refuse any request whose
    // headers would have needed one.
    if (Object.keys(await route.request().allHeaders()).some((name) => !isSimpleHeader(name))) {
      await route.fulfill({ status: 405, headers: CORS });
      return true;
    }
    if (this.failing) {
      await route.fulfill({ status: 503, headers: CORS, body: 'Service Unavailable' });
      return true;
    }
    return false;
  }
}

function isSimpleHeader(name: string): boolean {
  return ['accept', 'accept-language', 'content-language', 'referer', 'user-agent', 'origin'].includes(name) || name.startsWith('sec-');
}

function lookup(terms: string[]) {
  const normalized: { from: string; to: string }[] = [];
  const redirects: { from: string; to: string }[] = [];
  const pages: { title: string; ns?: number; missing?: boolean }[] = [];
  for (const term of terms) {
    let title = term.replaceAll('_', ' ');
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title !== term) {
      normalized.push({ from: term, to: title });
    }
    const target = REDIRECTS[title];
    if (target) {
      redirects.push({ from: title, to: target });
      title = target;
    }
    if (title in VIEWS || title === WITHOUT_VIEWS) {
      pages.push({ title, ns: 0 });
    } else if (title in NAMESPACED) {
      pages.push({ title, ns: NAMESPACED[title] });
    } else {
      pages.push({ title, ns: 0, missing: true });
    }
  }
  return { query: { normalized, redirects, pages } };
}

function json(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });
}

export const test = base.extend<{ wiki: WikiStub; hideTutorial: boolean }>({
  hideTutorial: [true, { option: true }],
  wiki: [
    async ({ context }, use) => {
      const wiki = new WikiStub();
      await wiki.install(context);
      await use(wiki);
    },
    { auto: true },
  ],
  context: async ({ context, hideTutorial }, use) => {
    // Re-seeded on every document load, so specs that need state to survive a reload navigate inside the SPA.
    if (hideTutorial) {
      await context.addInitScript(() => localStorage.setItem('shitishot:tutorial', JSON.stringify({ show: false, step: 'NextTitle' })));
    }
    await use(context);
  },
});

export { expect };

export function slots(page: Page) {
  return page.locator('[data-board-slot]');
}

export function deckCard(page: Page) {
  return page.locator('[data-deck]');
}

export async function pointIn(locator: Locator, fractionX = 0.5): Promise<{ x: number; y: number }> {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width * fractionX, y: box.y + box.height / 2 };
}

export async function press(page: Page, locator: Locator, fractionX = 0.5): Promise<void> {
  const { x, y } = await pointIn(locator, fractionX);
  await page.mouse.move(x, y);
  await page.mouse.down();
}

export async function moveTo(page: Page, point: { x: number; y: number }): Promise<void> {
  await page.mouse.move(point.x, point.y, { steps: 5 });
}

export async function waitForGame(page: Page): Promise<void> {
  await expect(page.locator('[data-board]')).toBeVisible();
  await expect(page.locator('[data-number]')).toHaveCount(5);
}

/** Taps all five columns of an empty board in order, placing the whole deck, and returns the placed titles. */
export async function placeAll(page: Page): Promise<string[]> {
  for (let index = 0; index < 5; index++) {
    await slots(page).nth(index).click();
  }
  await expect(deckCard(page)).toHaveCount(0);
  return slots(page).allInnerTexts();
}
