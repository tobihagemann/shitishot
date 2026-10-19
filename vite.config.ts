import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, type Plugin } from 'vite';

// GitHub Pages answers unknown paths with 404.html, so a copy of the SPA entry lets deep links like /settings
// load the app. Build-only, since Vite also calls closeBundle when the dev server shuts down.
function pagesFallback(): Plugin {
  let outDir = 'dist';
  return {
    name: 'pages-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
    },
  };
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), pagesFallback()],
  server: {
    port: 18489,
  },
});
