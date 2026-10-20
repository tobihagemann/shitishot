<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowPathIcon, CheckIcon } from '@heroicons/vue/16/solid';
import SettingsSelect from '../components/SettingsSelect.vue';
import { useSettings } from '../composables/useSettings.js';
import { useTutorial } from '../composables/useTutorial.js';
import { isLanguage } from '../lib/language.js';
import { isTitlesSource } from '../wikipedia/titles.js';

const { t } = useI18n();
const { language, titlesSource } = useSettings();
const tutorial = useTutorial();

const languageOptions = computed(() => [
  { value: 'de', label: t('language.de') },
  { value: 'en', label: t('language.en') },
]);
const titlesSourceOptions = computed(() => [
  { value: 'mostViewed', label: t('titlesSource.mostViewed') },
  { value: 'random', label: t('titlesSource.random') },
]);

function setLanguage(value: string): void {
  if (isLanguage(value)) {
    language.value = value;
  }
}

function setTitlesSource(value: string): void {
  if (isTitlesSource(value)) {
    titlesSource.value = value;
  }
}

const tutorialReset = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | null = null;

function resetTutorial(): void {
  tutorial.reset();
  tutorialReset.value = true;
  if (resetTimer) {
    clearTimeout(resetTimer);
  }
  resetTimer = setTimeout(() => {
    tutorialReset.value = false;
  }, 3000);
}

onUnmounted(() => {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }
});
</script>

<template>
  <section class="flex flex-col gap-8">
    <h1 class="text-2xl font-semibold tracking-tight text-neutral-900">{{ t('settings.heading') }}</h1>
    <div class="flex flex-col gap-1.5">
      <p class="text-sm font-medium text-neutral-900">{{ t('language.label') }}</p>
      <SettingsSelect :model-value="language" :options="languageOptions" :label="t('language.label')" @update:model-value="setLanguage" />
    </div>
    <div class="flex flex-col gap-1.5">
      <p class="text-sm font-medium text-neutral-900">{{ t('titlesSource.label') }}</p>
      <SettingsSelect :model-value="titlesSource" :options="titlesSourceOptions" :label="t('titlesSource.label')" @update:model-value="setTitlesSource" />
    </div>
    <div class="flex flex-col gap-2">
      <p class="text-sm font-medium text-neutral-900">{{ t('settings.instructions') }}</p>
      <blockquote class="flex flex-col gap-2 border-l-2 border-sky-600 pl-4 text-sm/6 text-neutral-700">
        <p>{{ t('settings.instructionsText') }}</p>
        <footer class="text-neutral-500">
          — {{ t('settings.instructionsBy') }} <cite>{{ t('settings.instructionsSource') }}</cite>
        </footer>
      </blockquote>
      <p class="text-sm text-neutral-500">{{ t('settings.instructionsNote') }}</p>
    </div>
    <div class="flex flex-col items-start gap-2">
      <p class="text-sm font-medium text-neutral-900">{{ t('settings.tutorial') }}</p>
      <button type="button" class="btn btn-secondary" @click="resetTutorial">
        <CheckIcon v-if="tutorialReset" class="size-4 shrink-0 text-green-600" aria-hidden="true" />
        <ArrowPathIcon v-else class="size-4 shrink-0" aria-hidden="true" />
        {{ tutorialReset ? t('settings.tutorialReset') : t('settings.resetTutorial') }}
      </button>
    </div>
  </section>
</template>
