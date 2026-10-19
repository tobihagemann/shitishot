<script setup lang="ts">
import { SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from 'reka-ui';
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/16/solid';

defineProps<{ modelValue: string; options: { value: string; label: string }[]; label: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="$emit('update:modelValue', String($event))">
    <SelectTrigger :aria-label="label" class="field flex items-center justify-between gap-2 text-left">
      <SelectValue class="block min-w-0 truncate" />
      <ChevronDownIcon class="size-4 shrink-0 text-neutral-500" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="6"
        class="z-30 max-h-60 min-w-(--reka-select-trigger-width) overflow-hidden rounded-lg bg-white p-1 shadow-lg ring-1 ring-neutral-950/10"
      >
        <SelectViewport>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-neutral-700 select-none data-highlighted:bg-neutral-100 data-highlighted:outline-hidden data-[state=checked]:font-semibold data-[state=checked]:text-neutral-900"
          >
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator>
              <CheckIcon class="size-4 shrink-0 text-red-600" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
