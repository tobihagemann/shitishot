<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Cog6ToothIcon } from '@heroicons/vue/16/solid';
import { useSettings } from './composables/useSettings.js';

const { t } = useI18n();
const { titlesSource } = useSettings();
</script>

<template>
  <div class="isolate flex min-h-dvh flex-col">
    <header class="sticky top-0 z-10 border-b border-neutral-950/10 bg-white/90 backdrop-blur">
      <div class="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <RouterLink to="/" class="flex items-center gap-2 text-lg font-semibold tracking-tight text-neutral-900">
          <img class="h-7 w-auto shrink-0" src="/assets/logo-nav.png" srcset="/assets/logo-nav@2x.png 2x" width="23" height="28" alt="" />
          {{ t('app.title') }}
        </RouterLink>
        <RouterLink :to="{ name: 'settings' }" class="icon-btn icon-btn-neutral" :aria-label="t('app.settings')">
          <Cog6ToothIcon class="size-4" />
        </RouterLink>
      </div>
    </header>
    <main class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <RouterView />
    </main>
    <footer class="border-t border-neutral-950/10">
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-sm text-neutral-500 sm:px-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            ©
            <a
              href="https://tobiha.de/"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-sm outline-sky-600 outline-offset-2 hover:text-neutral-900 focus-visible:outline-2"
              >{{ t('footer.copyright') }}</a
            >
          </p>
          <nav :aria-label="t('footer.nav')" class="flex flex-wrap gap-x-4 gap-y-1">
            <RouterLink :to="{ name: 'impressum' }" class="rounded-sm outline-sky-600 outline-offset-2 hover:text-neutral-900 focus-visible:outline-2">{{
              t('footer.impressum')
            }}</RouterLink>
            <RouterLink :to="{ name: 'privacy' }" class="rounded-sm outline-sky-600 outline-offset-2 hover:text-neutral-900 focus-visible:outline-2">{{
              t('footer.privacy')
            }}</RouterLink>
            <a
              href="https://github.com/tobihagemann/shitishot"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-sm outline-sky-600 outline-offset-2 hover:text-neutral-900 focus-visible:outline-2"
              >{{ t('footer.sourceCode') }}</a
            >
          </nav>
        </div>
        <p class="text-xs text-pretty text-neutral-400">
          {{ t('footer.inspiredPrefix') }}
          <a
            href="https://www.youtube.com/watch?v=upm6SfYuGX4"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-sm outline-sky-600 outline-offset-2 hover:text-neutral-900 focus-visible:outline-2"
            >{{ t('footer.inspiredGame') }}</a
          >
          {{ t('footer.inspiredMiddle') }}
          <a
            href="https://de.wikipedia.org/wiki/Neo_Magazin_Royale"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-sm outline-sky-600 outline-offset-2 hover:text-neutral-900 focus-visible:outline-2"
            >{{ t('footer.inspiredShow') }}</a
          >.
        </p>
        <p class="text-xs text-pretty text-neutral-400">{{ t('footer.numbers') }} • {{ t('titlesSource.label') }}: {{ t(`titlesSource.${titlesSource}`) }}</p>
      </div>
    </footer>
  </div>
</template>
