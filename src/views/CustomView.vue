<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { PlayCircleIcon, XMarkIcon } from '@heroicons/vue/16/solid';
import { useSettings } from '../composables/useSettings.js';
import { buildFragment, parseFragment } from '../lib/fragment.js';
import type { Language } from '../lib/language.js';
import { articleUrl } from '../wikipedia/articles.js';
import { resolveTerms } from '../wikipedia/resolve.js';

const FIELD_COUNT = 5;
const DEBOUNCE_MS = 400;

interface Field {
  value: string;
  /** The accepted lookup, kept with the exact term and language it was made for. */
  resolution: { term: string; lang: Language; title: string | null } | { term: string; lang: Language; failed: true } | null;
  request: number;
  timer: ReturnType<typeof setTimeout> | null;
}

const { t } = useI18n();
const router = useRouter();
const { language } = useSettings();
const fields = reactive<Field[]>(Array.from({ length: FIELD_COUNT }, () => ({ value: '', resolution: null, request: 0, timer: null })));

function termOf(field: Field): string {
  return field.value.trim();
}

/** Clears the field's lookup at once so Play can never act on a stale one, then schedules a debounced lookup for a non-empty term. */
function invalidate(field: Field): void {
  field.resolution = null;
  field.request++;
  if (field.timer) {
    clearTimeout(field.timer);
    field.timer = null;
  }
  if (termOf(field) !== '') {
    field.timer = setTimeout(() => void resolveField(field), DEBOUNCE_MS);
  }
}

// Only the latest request for a field, for the term the field still holds, is accepted; anything else is stale.
async function resolveField(field: Field): Promise<void> {
  field.timer = null;
  const term = termOf(field);
  const lang = language.value;
  const request = ++field.request;
  let resolution: Field['resolution'];
  try {
    const [result] = await resolveTerms([term], lang, { search: true });
    resolution = { term, lang, title: result?.status === 'ok' ? result.title : null };
  } catch {
    resolution = { term, lang, failed: true };
  }
  if (request === field.request && term === termOf(field)) {
    field.resolution = resolution;
  }
}

function currentTitle(field: Field): string | null | undefined {
  const resolution = field.resolution;
  if (!resolution || 'failed' in resolution || resolution.term !== termOf(field) || resolution.lang !== language.value) {
    return undefined;
  }
  return resolution.title;
}

const resolvedTitles = computed(() => fields.map(currentTitle));

/** For each field, the 1-based number of an earlier field resolving to the same article, if any. */
const duplicateOf = computed(() =>
  resolvedTitles.value.map((title, index) => {
    const first = title ? resolvedTitles.value.indexOf(title) : -1;
    return first !== -1 && first < index ? first + 1 : null;
  }),
);
const canPlay = computed(() => resolvedTitles.value.every((title) => typeof title === 'string') && duplicateOf.value.every((number) => number === null));

function play(): void {
  if (canPlay.value) {
    void router.push('/#' + buildFragment(resolvedTitles.value as string[]));
  }
}

function edit(field: Field, value: string): void {
  field.value = value;
  invalidate(field);
}

function reset(): void {
  fields.forEach((field) => edit(field, ''));
}

watch(language, () => fields.forEach(invalidate));

onMounted(() => {
  const titles = parseFragment(window.location.hash).titles ?? [];
  titles.slice(0, FIELD_COUNT).forEach((title, index) => edit(fields[index]!, title));
  if (window.location.hash) {
    void router.replace('/custom');
  }
});

onUnmounted(() => {
  for (const field of fields) {
    if (field.timer) {
      clearTimeout(field.timer);
    }
  }
});
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="play">
    <div v-for="(field, index) in fields" :key="index" class="flex flex-col gap-1.5">
      <label :for="`term-${index}`" class="text-sm font-medium text-neutral-900">{{ t('custom.term', { number: index + 1 }) }}</label>
      <input
        :id="`term-${index}`"
        :value="field.value"
        type="text"
        class="field"
        autocomplete="off"
        @input="edit(field, ($event.target as HTMLInputElement).value)"
      />
      <p class="min-h-5 text-[13px] text-neutral-500" :data-resolution="index">
        <template v-if="termOf(field) === ''" />
        <template v-else-if="field.resolution && 'failed' in field.resolution">{{ t('custom.unreachable') }}</template>
        <template v-else-if="resolvedTitles[index] === undefined">{{ t('custom.resolving') }}</template>
        <template v-else-if="resolvedTitles[index] === null">{{ t('custom.notFound') }}</template>
        <template v-else-if="duplicateOf[index] !== null">{{ t('custom.duplicate', { number: duplicateOf[index] ?? 0 }) }}</template>
        <template v-else>
          →
          <a class="link" :href="articleUrl(resolvedTitles[index], language)" target="_blank" rel="noopener noreferrer">{{ resolvedTitles[index] }}</a>
        </template>
      </p>
    </div>
    <div class="flex justify-between gap-2">
      <button type="submit" class="btn btn-primary" :disabled="!canPlay">
        <PlayCircleIcon class="size-4 shrink-0" aria-hidden="true" />
        {{ t('custom.play') }}
      </button>
      <button type="button" class="btn btn-secondary" @click="reset">
        <XMarkIcon class="size-4 shrink-0" aria-hidden="true" />
        {{ t('custom.reset') }}
      </button>
    </div>
  </form>
</template>
