import type { Slots } from './placement.js';

export interface Word {
  title: string;
  views: number;
}

/** The numbers shown in the column footers: every word's displayed views, ascending. */
export function columnNumbers(words: readonly Word[]): number[] {
  return words.map((word) => word.views).sort((a, b) => a - b);
}

/**
 * A column is correct when its card's displayed views equal the column's number, so cards with equal
 * displayed numbers are interchangeable.
 */
export function scoreBoard(slots: Readonly<Slots>, words: readonly Word[]): { correct: boolean[]; score: number } {
  const numbers = columnNumbers(words);
  const views = new Map(words.map((word) => [word.title, word.views]));
  const correct = slots.map((title, index) => title != null && views.get(title) === numbers[index]);
  return { correct, score: correct.filter(Boolean).length };
}

/**
 * For each wrong column, a title that belongs there: a card with that column's number that is not already shown
 * as correct elsewhere. Assigned greedily in column order, so a tied card is never named twice. Correct columns
 * get null.
 */
export function correctTitlesFor(slots: Readonly<Slots>, words: readonly Word[]): (string | null)[] {
  const numbers = columnNumbers(words);
  const { correct } = scoreBoard(slots, words);
  const named = new Set(slots.filter((title, index) => correct[index]));
  return numbers.map((value, index) => {
    if (correct[index]) {
      return null;
    }
    const match = words.find((word) => word.views === value && !named.has(word.title));
    if (!match) {
      return null;
    }
    named.add(match.title);
    return match.title;
  });
}
