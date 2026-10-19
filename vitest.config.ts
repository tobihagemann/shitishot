import { defineConfig } from 'vitest/config';

// UTC+14 keeps local and UTC calendar dates apart, so a date helper that reads local time fails its tests.
process.env.TZ = 'Pacific/Kiritimati';

export default defineConfig({
  test: {
    environment: 'node',
    // The default include also matches the Playwright specs under tests/e2e, which throw when loaded by Vitest.
    include: ['src/**/*.test.ts'],
  },
});
