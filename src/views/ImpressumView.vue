<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { legal } from '../locales/legal.de.js';

const { t } = useI18n({ useScope: 'local', inheritLocale: false, locale: 'de', messages: { de: legal } });
</script>

<template>
  <section class="flex flex-1 flex-col gap-8 py-2">
    <h1 class="text-2xl font-semibold tracking-tight text-neutral-900">{{ t('impressum.title') }}</h1>
    <div class="flex max-w-[70ch] flex-col gap-8 text-sm/6 text-neutral-600">
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('impressum.providerHeading') }}</h2>
        <address class="not-italic">
          {{ t('impressum.name') }}<br />
          {{ t('impressum.street') }}<br />
          {{ t('impressum.city') }}
        </address>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('impressum.contactHeading') }}</h2>
        <p>
          {{ t('impressum.emailLabel') }}: <a class="link" :href="`mailto:${t('impressum.email')}`">{{ t('impressum.email') }}</a>
        </p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('impressum.liabilityContentHeading') }}</h2>
        <p>{{ t('impressum.liabilityContent') }}</p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('impressum.liabilityLinksHeading') }}</h2>
        <p>{{ t('impressum.liabilityLinks') }}</p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('impressum.copyrightHeading') }}</h2>
        <p>{{ t('impressum.copyright') }}</p>
        <p>
          {{ t('impressum.sourceNote') }}
          <a class="link" href="https://github.com/tobihagemann/shitishot" target="_blank" rel="noopener noreferrer">github.com/tobihagemann/shitishot</a>
        </p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('impressum.disputeHeading') }}</h2>
        <p>{{ t('impressum.dispute') }}</p>
        <p><a class="link" href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a></p>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-base font-medium text-neutral-900">{{ t('impressum.privacyHeading') }}</h2>
        <p>
          {{ t('impressum.privacy') }}
          <RouterLink class="link" :to="{ name: 'privacy' }">{{ t('impressum.privacyLink') }}</RouterLink
          >.
        </p>
      </section>
    </div>
    <p class="text-xs text-neutral-400">{{ t('impressum.updated') }}</p>
  </section>
</template>
