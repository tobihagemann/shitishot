<script setup lang="ts">
import { CheckIcon, XMarkIcon } from '@heroicons/vue/16/solid';
import { useI18n } from 'vue-i18n';
import type { Slots } from '../../lib/placement.js';

defineProps<{
  slots: Slots;
  numbers: number[];
  results: { correct: boolean[]; correctTitles: (string | null)[] } | null;
  selected: number | null;
  hoverIndex: number | null;
  dragging: boolean;
  tappable: boolean;
}>();
defineEmits<{ slotPointerdown: [event: PointerEvent, index: number]; slotClick: [index: number] }>();

const { t, n } = useI18n();
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-xl ring-1 ring-neutral-950/10 board:flex-row" data-board>
    <div
      v-for="(title, index) in slots"
      :key="index"
      class="flex min-w-0 flex-row border-neutral-950/10 bg-white not-first:border-t board:flex-1 board:flex-col board:not-first:border-t-0 board:not-first:border-l"
      data-column
    >
      <button
        v-if="!results"
        type="button"
        class="relative flex min-h-14 min-w-0 flex-1 items-center px-3.5 py-2.5 text-left touch-none outline-sky-600 -outline-offset-2 select-none focus-visible:outline-2 board:min-h-30 board:justify-center board:px-2.5 board:py-3.5 board:text-center"
        :class="{
          'cursor-grab': title != null,
          'bg-sky-50 ring-2 ring-sky-600 ring-inset': hoverIndex === index || (selected === index && !dragging),
          'cursor-pointer after:pointer-events-none after:absolute after:inset-1.5 after:rounded-lg after:border-[1.5px] after:border-dashed after:border-sky-600/35':
            title == null && tappable && !dragging,
        }"
        :aria-label="title != null ? t('game.slot', { column: index + 1, title }) : t('game.emptySlot', { column: index + 1 })"
        :aria-pressed="selected === index"
        :data-board-slot="index"
        @pointerdown="$emit('slotPointerdown', $event, index)"
        @click="$emit('slotClick', index)"
      >
        <span v-if="title != null" class="font-semibold [overflow-wrap:anywhere]">{{ title }}</span>
        <span v-else class="text-neutral-400 italic" aria-hidden="true">–</span>
      </button>
      <div
        v-else-if="results.correct[index]"
        class="flex min-h-14 min-w-0 flex-1 items-center gap-1.5 bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white [overflow-wrap:anywhere] board:min-h-30 board:justify-center board:px-2.5 board:text-center"
        data-result="correct"
      >
        <CheckIcon class="size-4 shrink-0" aria-hidden="true" />
        <span class="sr-only">{{ t('game.correct') }}:</span>
        {{ title }}
      </div>
      <div
        v-else
        class="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1 px-3.5 py-2.5 text-sm [overflow-wrap:anywhere] board:min-h-30 board:items-center board:px-2.5 board:text-center"
        data-result="wrong"
      >
        <span class="flex items-center gap-1.5 text-red-600" data-placed>
          <XMarkIcon class="size-4 shrink-0" aria-hidden="true" />
          <span class="sr-only">{{ t('game.wrong') }}:</span>
          {{ title }}
        </span>
        <span class="flex items-center gap-1.5 font-semibold text-green-700" data-expected>
          <CheckIcon class="size-4 shrink-0" aria-hidden="true" />
          <span class="sr-only">{{ t('game.correct') }}:</span>
          {{ results.correctTitles[index] }}
        </span>
      </div>
      <div
        class="flex w-28 shrink-0 items-center justify-end border-l border-neutral-950/10 bg-neutral-50 px-3.5 py-2.5 text-[13px] text-neutral-500 tabular-nums board:w-auto board:justify-center board:border-t board:border-l-0"
        data-number
      >
        {{ n(numbers[index] ?? 0, 'integer') }}
      </div>
    </div>
  </div>
</template>
