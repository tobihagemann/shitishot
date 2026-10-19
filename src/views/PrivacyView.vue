<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { legal } from '../locales/legal.de.js';

const { t } = useI18n({ useScope: 'local', inheritLocale: false, locale: 'de', messages: { de: legal } });
</script>

<template>
  <section class="flex flex-1 flex-col gap-8 py-2">
    <h1 class="text-2xl font-semibold tracking-tight text-neutral-900">{{ t('privacy.title') }}</h1>
    <div class="flex max-w-[70ch] flex-col gap-8 text-sm/6 text-neutral-600">
      <p>{{ t('privacy.intro') }}</p>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('privacy.controllerHeading') }}</h2>
        <p>
          {{ t('privacy.controller') }}
          <RouterLink class="link" :to="{ name: 'impressum' }">{{ t('impressum.title') }}</RouterLink
          >.
        </p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('privacy.hostingHeading') }}</h2>
        <p>{{ t('privacy.hosting') }}</p>
        <p>
          {{ t('privacy.hostingPolicyIntro') }}
          <a
            class="link"
            href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
            >{{ t('privacy.hostingPolicyLink') }}</a
          >.
        </p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('privacy.wikimediaHeading') }}</h2>
        <p>{{ t('privacy.wikimedia') }}</p>
        <p>
          {{ t('privacy.wikimediaPolicyIntro') }}
          <a class="link" href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy" target="_blank" rel="noopener noreferrer">{{
            t('privacy.wikimediaPolicyLink')
          }}</a
          >.
        </p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('privacy.storageHeading') }}</h2>
        <p>{{ t('privacy.storage') }}</p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('privacy.trackingHeading') }}</h2>
        <p>{{ t('privacy.tracking') }}</p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('privacy.rightsHeading') }}</h2>
        <p>{{ t('privacy.rights') }}</p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('privacy.changesHeading') }}</h2>
        <p>{{ t('privacy.changes') }}</p>
      </section>
    </div>
    <p class="text-xs text-neutral-400">{{ t('privacy.updated') }}</p>
  </section>
</template>
