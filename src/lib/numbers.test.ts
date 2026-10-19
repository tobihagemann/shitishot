import { describe, expect, it } from 'vitest';
import { roundToSignificant } from './numbers.js';

describe('roundToSignificant', () => {
  it.each([
    [0, 0],
    [1, 1],
    [12, 12],
    [123, 123],
    [1234, 1230],
    [1235, 1240],
    [1999, 2000],
    [999_999, 1_000_000],
  ])('rounds %i to %i', (value, expected) => {
    expect(roundToSignificant(value, 3)).toBe(expected);
  });
});
