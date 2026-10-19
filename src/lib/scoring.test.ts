import { describe, expect, it } from 'vitest';
import { correctTitlesFor, scoreBoard } from './scoring.js';

const words = [
  { title: 'C', views: 300 },
  { title: 'A', views: 100 },
  { title: 'E', views: 500 },
  { title: 'B', views: 200 },
  { title: 'D', views: 400 },
];

describe('scoreBoard', () => {
  it('scores 5 for the ascending order', () => {
    expect(scoreBoard(['A', 'B', 'C', 'D', 'E'], words)).toEqual({ correct: [true, true, true, true, true], score: 5 });
  });

  it('scores 3 when two distinct numbers are swapped', () => {
    expect(scoreBoard(['B', 'A', 'C', 'D', 'E'], words).score).toBe(3);
  });

  it('treats cards with equal displayed numbers as interchangeable', () => {
    const tied = [
      { title: 'A', views: 10 },
      { title: 'B', views: 10 },
      { title: 'C', views: 50 },
      { title: 'D', views: 80 },
      { title: 'E', views: 90 },
    ];
    expect(scoreBoard(['B', 'A', 'C', 'D', 'E'], tied).score).toBe(5);
  });
});

describe('correctTitlesFor', () => {
  it('never names a tied card already shown as correct in another column', () => {
    const tied = [
      { title: 'A', views: 10 },
      { title: 'B', views: 10 },
      { title: 'C', views: 50 },
      { title: 'D', views: 80 },
      { title: 'E', views: 90 },
    ];
    // A sits correctly (by tie) in column 1; B is wrongly in column 3.
    const slots = ['C', 'A', 'D', 'B', 'E'];
    expect(scoreBoard(slots, tied).correct).toEqual([false, true, false, false, true]);
    expect(correctTitlesFor(slots, tied)).toEqual(['B', null, 'C', 'D', null]);
  });
});
