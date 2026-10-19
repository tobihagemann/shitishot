import { computed, ref } from 'vue';
import { buildShareUrl } from '../lib/fragment.js';
import { isLanguage, type Language } from '../lib/language.js';
import type { Slots } from '../lib/placement.js';
import { columnNumbers, correctTitlesFor, scoreBoard, type Word } from '../lib/scoring.js';
import { shuffle } from '../lib/shuffle.js';
import { getThirtyDayViews } from '../wikipedia/pageviews.js';
import { resolveTerms } from '../wikipedia/resolve.js';
import { getCandidateTitles } from '../wikipedia/titles.js';
import { useSettings } from './useSettings.js';
import { useStoredJson } from './useStorage.js';

const CARD_COUNT = 5;
const CANDIDATE_ROUNDS = 3;
const RESOLVE_BATCH = 50;

interface StoredGame {
  lang: Language;
  /** Deal order. */
  words: Word[];
  slots: Slots;
  revealed: boolean;
  /** Requested terms that were swapped for generated titles. */
  replacedTerms: string[];
}

interface NewGameRequest {
  titles?: string[];
  lang?: Language;
  /** Undecodable fragment components, reported as replaced. */
  invalid?: string[];
}

type GameError = 'unreachable' | 'assembly';

class AssemblyError extends Error {}

function isStoredGame(value: unknown): value is StoredGame {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const game = value as Partial<StoredGame>;
  if (
    !isLanguage(game.lang) ||
    typeof game.revealed !== 'boolean' ||
    !Array.isArray(game.replacedTerms) ||
    !Array.isArray(game.words) ||
    !Array.isArray(game.slots)
  ) {
    return false;
  }
  const titles = game.words.map((word) => word?.title);
  const placed = game.slots.filter((slot) => slot !== null);
  return (
    game.words.length === CARD_COUNT &&
    game.words.every((word) => typeof word?.title === 'string' && typeof word.views === 'number') &&
    new Set(titles).size === CARD_COUNT &&
    game.slots.length === CARD_COUNT &&
    placed.every((slot) => titles.includes(slot)) &&
    new Set(placed).size === placed.length &&
    game.replacedTerms.every((term) => typeof term === 'string')
  );
}

const game = useStoredJson<StoredGame | null>('shitishot:game', null, (value): value is StoredGame | null => value === null || isStoredGame(value));
const loading = ref(false);
const error = ref<GameError | null>(null);
let lastRequest: NewGameRequest = {};
let latestCall = 0;

// Every card is a resolved ns-0 article and the five are pairwise distinct, so re-resolving a share link's titles
// deals the same game again.
async function assembleGame({ titles = [], lang, invalid = [] }: NewGameRequest): Promise<StoredGame> {
  const { language, titlesSource } = useSettings();
  const gameLang = lang ?? language.value;
  const replacedTerms = [...invalid];
  const kept: string[] = [];

  const requested = titles.slice(0, CARD_COUNT);
  if (requested.length > 0) {
    for (const resolution of await resolveTerms(requested, gameLang, { search: true })) {
      if (resolution.status === 'ok' && !kept.includes(resolution.title)) {
        kept.push(resolution.title);
      } else {
        replacedTerms.push(resolution.term);
      }
    }
  }

  for (let round = 0; kept.length < CARD_COUNT; round++) {
    if (round === CANDIDATE_ROUNDS) {
      throw new AssemblyError();
    }
    const candidates = await getCandidateTitles(titlesSource.value, gameLang);
    for (let start = 0; start < candidates.length && kept.length < CARD_COUNT; start += RESOLVE_BATCH) {
      for (const resolution of await resolveTerms(candidates.slice(start, start + RESOLVE_BATCH), gameLang, { search: false })) {
        if (resolution.status === 'ok' && !kept.includes(resolution.title) && kept.length < CARD_COUNT) {
          kept.push(resolution.title);
        }
      }
    }
  }

  const views = await getThirtyDayViews(kept, gameLang);
  return {
    lang: gameLang,
    words: shuffle(kept.map((title, index) => ({ title, views: views[index] ?? 0 }))),
    slots: Array<string | null>(CARD_COUNT).fill(null),
    revealed: false,
    replacedTerms,
  };
}

/** The latest call wins: an older call that settles later never touches state. */
async function newGame(request: NewGameRequest = {}): Promise<void> {
  lastRequest = request;
  const call = ++latestCall;
  loading.value = true;
  error.value = null;
  try {
    const assembled = await assembleGame(request);
    if (call === latestCall) {
      game.value = assembled;
    }
  } catch (cause) {
    if (call === latestCall) {
      console.error(cause);
      error.value = cause instanceof AssemblyError ? 'assembly' : 'unreachable';
    }
  } finally {
    if (call === latestCall) {
      loading.value = false;
    }
  }
}

function retry(): Promise<void> {
  return newGame(lastRequest);
}

/** The single mutation path for the board's slots. */
function commitPlacement(slots: Slots): void {
  if (game.value && !game.value.revealed) {
    game.value = { ...game.value, slots };
  }
}

function showResults(): void {
  if (game.value) {
    game.value = { ...game.value, revealed: true };
  }
}

const deck = computed(() => {
  const current = game.value;
  return current ? current.words.map((word) => word.title).filter((title) => !current.slots.includes(title)) : [];
});
const numbers = computed(() => (game.value ? columnNumbers(game.value.words) : []));
const results = computed(() => {
  const current = game.value;
  if (!current?.revealed) {
    return null;
  }
  return { ...scoreBoard(current.slots, current.words), correctTitles: correctTitlesFor(current.slots, current.words) };
});
const shareUrl = computed(() =>
  game.value
    ? buildShareUrl(
        location.origin,
        game.value.words.map((word) => word.title),
        game.value.lang,
      )
    : null,
);

export function useGame() {
  return { game, loading, error, deck, numbers, results, shareUrl, newGame, retry, commitPlacement, showResults };
}
