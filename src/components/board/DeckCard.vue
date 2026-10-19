<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHorizontalBoard } from '../../composables/useBoardLayout.js';
import { useTutorial } from '../../composables/useTutorial.js';
import TutorialPopover from '../tutorial/TutorialPopover.vue';

defineProps<{ title: string | null; selected: boolean; lifted: boolean; swapping: boolean }>();
defineEmits<{ pointerdown: [event: PointerEvent]; click: []; showResults: [] }>();

const { t } = useI18n();
const tutorial = useTutorial();
const horizontal = useHorizontalBoard();
// Beside the card on the horizontal board, so the hint never covers the columns it points to.
const side = computed(() => (horizontal.value ? 'right' : 'bottom'));
</script>

<template>
  <div class="flex min-h-26 flex-col items-center justify-center gap-2">
    <TutorialPopover
      v-if="title"
      :open="tutorial.isAt('NextTitle')"
      :side="side"
      :message="t('tutorial.nextTitle')"
      :action="t('tutorial.skip')"
      @action="tutorial.finish()"
    >
      <button
        type="button"
        class="max-w-70 min-w-50 cursor-grab touch-none rounded-xl bg-white px-5 py-4.5 text-center font-semibold shadow-sm outline-red-600 outline-offset-2 select-none focus-visible:outline-2"
        :class="[selected ? 'ring-2 ring-red-600' : 'ring-1 ring-neutral-950/10', { 'opacity-35': lifted }]"
        :aria-pressed="selected"
        data-deck
        @pointerdown="$emit('pointerdown', $event)"
        @click="$emit('click')"
      >
        {{ title }}
      </button>
    </TutorialPopover>
    <TutorialPopover v-else :open="tutorial.isAt('ShowResults')" :side="side" :message="t('tutorial.showResults')">
      <button type="button" class="btn btn-primary" @click="$emit('showResults')">{{ t('game.showResults') }}</button>
    </TutorialPopover>
    <p v-if="title || swapping" class="text-center text-[13px] text-neutral-500">{{ swapping ? t('game.hintSelected') : t('game.hintDeck') }}</p>
  </div>
</template>
