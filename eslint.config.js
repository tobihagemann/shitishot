import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import configPrettier from 'eslint-config-prettier';

export default defineConfig(
  { ignores: ['dist/**', 'playwright-report/**', 'test-results/**', '.turbo/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    // TypeScript checks identifiers itself, and the core no-undef rule misfires on TS code. App.vue is a deliberate
    // single-word component name.
    files: ['**/*.ts', '**/*.vue'],
    rules: { 'no-undef': 'off', 'vue/multi-word-component-names': 'off' },
  },
  configPrettier,
);
