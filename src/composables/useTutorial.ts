import { useStoredJson } from './useStorage.js';

const STEPS = ['NextTitle', 'NextTitleBreak', 'SortTitles', 'SortTitlesBreak', 'ShowResults', 'EvaluateResults', 'NewGame', 'CustomGame', 'CopyURL'] as const;
type TutorialStep = (typeof STEPS)[number];

interface TutorialState {
  show: boolean;
  step: TutorialStep;
}

function isTutorialState(value: unknown): value is TutorialState {
  const state = value as Partial<TutorialState> | null;
  return typeof state?.show === 'boolean' && STEPS.includes(state.step as TutorialStep);
}

const state = useStoredJson<TutorialState>('shitishot:tutorial', { show: true, step: 'NextTitle' }, isTutorialState);

function isAt(step: TutorialStep): boolean {
  return state.value.show && state.value.step === step;
}

/** Moves to the step after `step` when the tutorial has not got past it yet, so an event also ends earlier steps. */
function advancePast(step: TutorialStep): void {
  const index = STEPS.indexOf(step);
  const next = STEPS[index + 1];
  if (state.value.show && STEPS.indexOf(state.value.step) <= index) {
    state.value = next ? { show: true, step: next } : { show: false, step: 'NextTitle' };
  }
}

/** Puts a tutorial that is still in its board steps onto the step matching the board, so it never waits on an anchor that isn't shown. */
function syncWithBoard({ placed, total, revealed }: { placed: number; total: number; revealed: boolean }): void {
  if (!state.value.show || STEPS.indexOf(state.value.step) >= STEPS.indexOf('EvaluateResults')) {
    return;
  }
  const step: TutorialStep = revealed ? 'EvaluateResults' : placed === total ? 'ShowResults' : placed > 0 ? 'SortTitles' : 'NextTitle';
  state.value = { show: true, step };
}

function restartForNewGame(): void {
  if (state.value.show) {
    state.value = { show: true, step: 'NextTitle' };
  }
}

function finish(): void {
  state.value = { show: false, step: 'NextTitle' };
}

function reset(): void {
  state.value = { show: true, step: 'NextTitle' };
}

export function useTutorial() {
  return { isAt, advancePast, syncWithBoard, restartForNewGame, finish, reset };
}
