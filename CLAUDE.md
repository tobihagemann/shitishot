# The Shit Is Hot

A browser-only, bilingual (de/en) solo guessing game: place five Wikipedia articles in order of their 30-day pageviews. A single Vue 3 (`<script setup>`) SPA at the repo root, built with Vite and deployed to GitHub Pages. Node 22, pnpm via Corepack.

## Layout

- `src/lib/` — pure game logic (placement, scoring, share fragment, dates, rounding), Vitest-covered.
- `src/wikipedia/` — the Wikimedia client: action API for resolution and candidates, REST for pageviews and the most-viewed list.
- `src/composables/` — game state (`useGame`), drag gestures, tutorial, settings, localStorage refs.
- `src/views/`, `src/components/<area>/` — routes and UI. `src/locales/` holds the de/en messages and the German-only legal text.
- `tests/e2e/` — Playwright specs; `fixtures.ts` stubs every Wikimedia endpoint.
- `brand/TheShitIsHot.icon` — the Icon Composer document that `scripts/export-icon.ts` renders every icon and logo in `public/` from.

## Commands & the merge gate

| Command                           | Use                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`                        | Vite dev server on :18489                                                              |
| `pnpm build`                      | `vue-tsc` + Vite build; also writes `dist/404.html`, the Pages fallback for deep links |
| `pnpm typecheck`                  | `vue-tsc` only                                                                         |
| `pnpm lint` / `pnpm format:check` | ESLint / Prettier                                                                      |
| `pnpm knip`                       | unused files, exports and dependencies                                                 |
| `pnpm test`                       | Vitest over `src/**/*.test.ts`                                                         |
| `pnpm e2e`                        | Playwright against `vite preview` on :28489                                            |
| `pnpm icon`                       | re-render the icons and logos from the Icon Composer document (Mac with Xcode only)    |

`pnpm e2e` serves the built `dist`, so run `pnpm build` first. CI runs every command above except `dev` and `icon`, then deploys to Pages on pushes to `main`. **A non-zero exit from any of them, knip included, fails CI and blocks the deploy.**

## Conventions

- **Share fragments.** Parse the raw `window.location.hash` with `parseFragment`, never `route.hash`: titles are split on raw commas before decoding, so an encoded comma inside a title survives. Navigation that carries titles uses the string form `router.push('/#' + buildFragment(...))` (or `'/custom#'`), never an object-form `hash`, which vue-router re-encodes.
- **Taps vs. drags.** Taps run only from a button's `click` handler (mouse, touch and keyboard alike). `usePointerDrag` handles drags only and swallows just the click that trails a finished drag.
- **Dealt games.** Every card in `newGame` is a resolved ns-0 article and the five are pairwise distinct, so a share link deals the same game again.
- **Storage.** All localStorage keys use the `shitishot:` prefix and go through `useStoredJson`, which discards values that fail validation.
- **Wikimedia requests.** Never add a custom header (not even `Api-User-Agent`): the REST host (`wikimedia.org/api/rest_v1`) answers CORS preflights with 405, so every call stays a simple GET. `tests/e2e/fixtures.ts` answers any request with a non-simple header with 405, so a header slip fails the specs.
- **i18n.** No user-facing string is hardcoded in markup. Everything goes through vue-i18n, and `en.ts` must satisfy the `de.ts` schema. Legal pages are German-only via a local i18n scope.
- **Icons.** Use `@heroicons/vue/16/solid`. Icon-only buttons use `icon-btn` and carry an `aria-label`.
- **Supply chain.** Pin GitHub Actions to commit SHAs with a version comment. Bumping is manual.
