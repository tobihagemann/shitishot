import { onUnmounted, ref, type Ref } from 'vue';

// The same width as --breakpoint-board in main.css, so gestures and hints follow the board's layout.
const HORIZONTAL_QUERY = '(min-width: 36rem)';

/** Whether the board currently shows side-by-side columns, kept up to date on resize and rotation. */
export function useHorizontalBoard(): Ref<boolean> {
  const query = window.matchMedia(HORIZONTAL_QUERY);
  const horizontal = ref(query.matches);
  const update = () => {
    horizontal.value = query.matches;
  };
  query.addEventListener('change', update);
  onUnmounted(() => query.removeEventListener('change', update));
  return horizontal;
}
