import { describe, expect, it } from 'vitest';
import { thirtyDayRange } from './dates.js';

// vitest.config.ts runs these in UTC+14, so a local-time implementation lands on the wrong calendar day.
describe('thirtyDayRange', () => {
  it('uses UTC calendar dates', () => {
    expect(thirtyDayRange(new Date('2026-10-18T12:30:00Z'))).toEqual({ start: '20260917', end: '20261016' });
  });

  it('crosses a leap day', () => {
    expect(thirtyDayRange(new Date('2028-03-01T00:30:00Z'))).toEqual({ start: '20280130', end: '20280228' });
  });
});
