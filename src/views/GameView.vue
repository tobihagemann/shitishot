<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowPathIcon, CheckIcon, ClipboardIcon, PencilSquareIcon, PlayCircleIcon } from '@heroicons/vue/16/solid';
import DeckCard from '../components/board/DeckCard.vue';
import GameBoard from '../components/board/GameBoard.vue';
import TutorialPopover from '../components/tutorial/TutorialPopover.vue';
import { useGame } from '../composables/useGame.js';
import { usePointerDrag } from '../composables/usePointerDrag.js';
import { useSettings } from '../composables/useSettings.js';
import { useTutorial } from '../composables/useTutorial.js';
import { buildFragment, parseFragment } from '../lib/fragment.js';
import type { Slots } from '../lib/placement.js';

const EVALUATE_KEYS = [
  'tutorial.evaluate0',
  'tutorial.evaluate1',
  'tutorial.evaluate2',
  'tutorial.evaluate3',
  'tutorial.evaluate4',
  'tutorial.evaluate5',
] as const;

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { language } = useSettings();
const { game, loading, error, deck, numbers, results, shareUrl, newGame, retry, commitPlacement, showResults } = useGame();
const tutorial = useTutorial();

/** The placed card selected for a tap move or swap; null means the deck card, the default. */
const selected = ref<number | null>(null);

const drag = usePointerDrag({
  slots: () => game.value?.slots ?? [],
  onStart: (source) => {
    selected.value = null;
    if (source === 'deck') {
      tutorial.advancePast('NextTitle');
    }
  },
  onDrop: place,
});

const boardSlots = computed(() => drag.preview.value ?? game.value?.slots ?? []);
const nextTitle = computed(() => deck.value[0] ?? null);
const showsGame = computed(() => !loading.value && !error.value && game.value !== null);

function place(slots: Slots): void {
  commitPlacement(slots);
  selected.value = null;
  const placed = slots.filter((slot) => slot !== null).length;
  tutorial.advancePast(placed === slots.length ? 'SortTitlesBreak' : 'NextTitleBreak');
}

function onDeckPointerdown(event: PointerEvent): void {
  if (nextTitle.value) {
    drag.start(event, 'deck', nextTitle.value);
  }
}

function onSlotPointerdown(event: PointerEvent, index: number): void {
  const title = game.value?.slots[index];
  if (title) {
    drag.start(event, index, title);
  }
}

function onDeckClick(): void {
  if (!drag.consumeSuppressedClick()) {
    selected.value = null;
  }
}

// Tap rules: an empty slot takes the selected card (the deck card by default), a placed card becomes selected, a
// second placed card swaps with it, and the selected card again deselects. A tap never pushes neighbours aside.
function onSlotClick(index: number): void {
  const slots = game.value?.slots;
  if (drag.consumeSuppressedClick() || !slots) {
    return;
  }
  const from = selected.value;
  if (slots[index] == null) {
    const next = slots.slice();
    if (from !== null) {
      next[index] = slots[from] ?? null;
      next[from] = null;
      place(next);
    } else if (nextTitle.value) {
      next[index] = nextTitle.value;
      place(next);
    }
  } else if (from === index) {
    selected.value = null;
  } else if (from !== null) {
    const next = slots.slice();
    [next[index], next[from]] = [slots[from] ?? null, slots[index] ?? null];
    place(next);
  } else {
    selected.value = index;
  }
}

function onShowResults(): void {
  showResults();
  tutorial.advancePast('ShowResults');
}

function syncTutorial(): void {
  if (game.value && !loading.value) {
    const slots = game.value.slots;
    tutorial.syncWithBoard({ placed: slots.filter((slot) => slot !== null).length, total: slots.length, revealed: game.value.revealed });
  }
}

// Handles incoming share links. It parses the raw window.location.hash, never route.hash, because route.hash's
// decoding would break the split on raw commas. The route.hash watcher only signals that a link was opened in a
// tab already showing the game.
function checkFragment(onMount: boolean): void {
  const parsed = parseFragment(window.location.hash);
  if (parsed.titles || parsed.invalid.length > 0) {
    void newGame({ titles: parsed.titles, lang: parsed.lang, invalid: parsed.invalid });
  } else if (onMount && !game.value && !loading.value) {
    void newGame();
  }
  if (window.location.hash) {
    void router.replace('/');
  }
}

onMounted(() => {
  checkFragment(true);
  syncTutorial();
});
watch(
  () => route.hash,
  () => checkFragment(false),
);
// A drag belongs to the board it started on. End it once that board stops taking placements (revealed, or hidden
// while a new game loads or fails), so a pointer still held can never show or drop a stale snapshot.
watch(
  () => showsGame.value && !game.value?.revealed,
  () => drag.cancel(),
);
watch(
  () => game.value?.words,
  () => {
    selected.value = null;
    tutorial.restartForNewGame();
  },
);

const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | null = null;

async function copyUrl(): Promise<void> {
  if (!shareUrl.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
    if (copiedTimer) {
      clearTimeout(copiedTimer);
    }
    copiedTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    // ignore: clipboard may be unavailable
  }
}

onUnmounted(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer);
  }
});

function customGame(): void {
  void router.push(game.value ? '/custom#' + buildFragment(game.value.words.map((word) => word.title)) : '/custom');
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" role="status" class="flex flex-col items-center gap-3 py-16 text-sm text-neutral-500">
      <ArrowPathIcon class="size-4 animate-spin text-red-600" aria-hidden="true" />
      {{ t('game.loading') }}
    </div>

    <div v-else-if="error" role="alert" class="well flex flex-col items-center gap-3 text-center text-sm text-neutral-700">
      <p>{{ t(`error.${error}`) }}</p>
      <button type="button" class="btn btn-primary" @click="retry">
        <ArrowPathIcon class="size-4 shrink-0" aria-hidden="true" />
        {{ t('game.retry') }}
      </button>
    </div>

    <template v-else-if="game">
      <p
        v-if="game.replacedTerms.length > 0"
        class="rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-800 ring-1 ring-amber-600/20"
        data-replaced
      >
        {{ t('game.replaced', { terms: game.replacedTerms.join(', ') }) }}
      </p>

      <DeckCard
        v-if="!results"
        :title="nextTitle"
        :selected="selected === null && !drag.dragging.value"
        :lifted="drag.dragging.value === 'deck'"
        :swapping="selected !== null"
        @pointerdown="onDeckPointerdown"
        @click="onDeckClick"
        @show-results="onShowResults"
      />

      <TutorialPopover
        :open="tutorial.isAt('SortTitles')"
        :message="t('tutorial.sortTitles')"
        :action="t('tutorial.close')"
        @action="tutorial.advancePast('SortTitles')"
      >
        <GameBoard
          :slots="boardSlots"
          :numbers="numbers"
          :results="results"
          :selected="selected"
          :hover-index="drag.hoverIndex.value"
          :dragging="drag.dragging.value !== null"
          :tappable="nextTitle !== null || selected !== null"
          @slot-pointerdown="onSlotPointerdown"
          @slot-click="onSlotClick"
        />
      </TutorialPopover>

      <template v-if="results">
        <TutorialPopover
          :open="tutorial.isAt('EvaluateResults')"
          :message="t(EVALUATE_KEYS[results.score] ?? 'tutorial.evaluate0')"
          :action="t('tutorial.next')"
          @action="tutorial.advancePast('EvaluateResults')"
        >
          <p class="text-center font-semibold" data-score>{{ t('game.score', { score: results.score }) }}</p>
        </TutorialPopover>
        <div v-if="game.lang !== language" class="flex flex-col gap-1 text-center text-sm text-neutral-500" data-different-settings>
          <p>{{ t('game.differentSettings', { language: t(`language.${game.lang}`) }) }}</p>
          <p>
            {{ t('game.ownSettingsPrefix') }}
            <RouterLink class="link" :to="{ name: 'settings' }">{{ t('game.ownSettingsLink') }}</RouterLink>
            {{ t('game.ownSettingsSuffix') }}
          </p>
        </div>
      </template>
    </template>

    <div class="flex flex-wrap gap-2">
      <TutorialPopover
        v-if="showsGame"
        :open="tutorial.isAt('CopyURL')"
        :message="t('tutorial.copyUrl')"
        :action="t('tutorial.finish')"
        side="top"
        @action="tutorial.finish()"
      >
        <button type="button" class="btn btn-secondary" @click="copyUrl">
          <CheckIcon v-if="copied" class="size-4 shrink-0" aria-hidden="true" />
          <ClipboardIcon v-else class="size-4 shrink-0" aria-hidden="true" />
          {{ copied ? t('game.copied') : t('game.copyUrl') }}
        </button>
      </TutorialPopover>
      <TutorialPopover
        :open="showsGame && tutorial.isAt('CustomGame')"
        :message="t('tutorial.customGame')"
        :action="t('tutorial.next')"
        side="top"
        @action="tutorial.advancePast('CustomGame')"
      >
        <button type="button" class="btn btn-secondary" @click="customGame">
          <PencilSquareIcon class="size-4 shrink-0" aria-hidden="true" />
          {{ t('game.customGame') }}
        </button>
      </TutorialPopover>
      <TutorialPopover
        :open="showsGame && tutorial.isAt('NewGame')"
        :message="t('tutorial.newGame')"
        :action="t('tutorial.next')"
        side="top"
        @action="tutorial.advancePast('NewGame')"
      >
        <button type="button" class="btn btn-secondary" @click="newGame()">
          <PlayCircleIcon class="size-4 shrink-0" aria-hidden="true" />
          {{ t('game.newGame') }}
        </button>
      </TutorialPopover>
    </div>

    <div
      v-if="drag.ghost.value"
      class="pointer-events-none fixed top-0 left-0 z-50 rounded-xl bg-white px-4.5 py-3.5 font-semibold whitespace-nowrap shadow-xl ring-2 ring-red-600"
      :style="{ transform: `translate(${drag.ghost.value.x}px, ${drag.ghost.value.y}px)` }"
      aria-hidden="true"
    >
      {{ drag.ghost.value.title }}
    </div>
  </div>
</template>
