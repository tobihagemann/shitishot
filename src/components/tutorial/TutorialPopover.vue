<script setup lang="ts">
import { PopoverAnchor, PopoverArrow, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui';

withDefaults(defineProps<{ open: boolean; message: string; action?: string; side?: 'top' | 'right' | 'bottom' | 'left' }>(), {
  action: undefined,
  side: 'bottom',
});
defineEmits<{ action: [] }>();
</script>

<template>
  <PopoverRoot :open="open">
    <PopoverAnchor>
      <slot />
    </PopoverAnchor>
    <PopoverPortal>
      <PopoverContent
        :side="side"
        :side-offset="8"
        :collision-padding="16"
        class="pointer-events-none z-20 flex w-72 max-w-[calc(100vw-2rem)] flex-col items-start gap-3 rounded-xl bg-neutral-900 p-4 text-sm text-white shadow-lg"
        data-tutorial
        @open-auto-focus.prevent
        @close-auto-focus.prevent
      >
        <!-- Click-through except for its button: on a phone the hint can cover columns the player should still tap. -->
        <p>{{ message }}</p>
        <button
          v-if="action"
          type="button"
          class="btn pointer-events-auto bg-white text-neutral-900 outline-white hover:bg-neutral-100"
          @click="$emit('action')"
        >
          {{ action }}
        </button>
        <PopoverArrow class="fill-neutral-900" :width="12" :height="6" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
