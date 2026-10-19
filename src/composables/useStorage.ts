import { ref, type Ref, watch } from 'vue';

/**
 * A ref mirrored to localStorage as JSON. A stored value that fails `isValid` (corrupt, or from an older shape) is
 * replaced by the fallback. Only assignments to `.value` are persisted, so replace objects instead of mutating them.
 * Storage errors (private mode, quota) leave it working as an in-memory ref.
 */
export function useStoredJson<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): Ref<T> {
  const stored = parseJson(safeGet(key));
  const state = ref(isValid(stored) ? stored : fallback) as Ref<T>;
  watch(state, (value) => safeSet(key, JSON.stringify(value)));
  return state;
}

function parseJson(raw: string | null): unknown {
  if (raw === null) {
    return undefined;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore unavailable storage
  }
}
