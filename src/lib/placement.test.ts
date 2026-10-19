import { describe, expect, it } from 'vitest';
import { directionFromPointer, placeTitle } from './placement.js';

describe('placeTitle', () => {
  it('shifts an occupied target toward the nearest empty slot in the given direction', () => {
    expect(placeTitle([null, 'A', 'B', null, null], 'X', 1, 1)).toEqual([null, 'X', 'A', 'B', null]);
    expect(placeTitle([null, 'A', 'B', null, null], 'X', 2, -1)).toEqual(['A', 'B', 'X', null, null]);
  });

  it('falls back to the other direction when that side is full', () => {
    expect(placeTitle([null, 'A', 'B', 'C', 'D'], 'X', 3, 1)).toEqual(['A', 'B', 'C', 'X', 'D']);
  });
});

describe('directionFromPointer', () => {
  const rect = { left: 0, right: 100, top: 0, bottom: 40 };

  it('uses the left and right halves on the horizontal board', () => {
    expect(directionFromPointer(rect, 30, 35, true)).toBe(1);
    expect(directionFromPointer(rect, 70, 5, true)).toBe(-1);
  });

  it('uses the top and bottom halves on the stacked board', () => {
    expect(directionFromPointer(rect, 70, 10, false)).toBe(1);
    expect(directionFromPointer(rect, 30, 30, false)).toBe(-1);
  });
});
