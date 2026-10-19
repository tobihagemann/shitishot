import { onUnmounted, ref } from 'vue';
import { directionFromPointer, placeTitle, type Direction, type Slots } from '../lib/placement.js';
import { useHorizontalBoard } from './useBoardLayout.js';

/** A drag's origin: the deck card, or the index of a placed card. */
export type DragSource = 'deck' | number;

const THRESHOLD_PX = 6;

interface PendingGesture {
  pointerId: number;
  source: DragSource;
  title: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  fixed: Slots;
  active: boolean;
  hover: number | null;
  direction: Direction | null;
}

/**
 * Pointer-event drag for the board, shared by mouse and touch. A press that moves less than the threshold is not a
 * drag and is left to the button's click handler, which owns every tap. While dragging, `preview` holds the board
 * as it would look after a drop at the hovered slot.
 */
export function usePointerDrag(options: { slots: () => Slots; onStart: (source: DragSource) => void; onDrop: (slots: Slots) => void }) {
  const horizontal = useHorizontalBoard();
  const preview = ref<Slots | null>(null);
  const hoverIndex = ref<number | null>(null);
  const ghost = ref<{ title: string; x: number; y: number } | null>(null);
  const dragging = ref<DragSource | null>(null);
  let gesture: PendingGesture | null = null;
  let suppressClick = false;
  let suppressTimer: ReturnType<typeof setTimeout> | null = null;

  function start(event: PointerEvent, source: DragSource, title: string): void {
    clearSuppress();
    if (event.button !== 0 || gesture) {
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    gesture = {
      pointerId: event.pointerId,
      source,
      title,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      fixed: options.slots().slice(),
      active: false,
      hover: null,
      direction: null,
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }

  function baseline(current: PendingGesture): Slots {
    const slots = current.fixed.slice();
    if (current.source !== 'deck') {
      slots[current.source] = null;
    }
    return slots;
  }

  function onMove(event: PointerEvent): void {
    const current = gesture;
    if (!current || event.pointerId !== current.pointerId) {
      return;
    }
    if (!current.active) {
      if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < THRESHOLD_PX) {
        return;
      }
      current.active = true;
      dragging.value = current.source;
      preview.value = baseline(current);
      options.onStart(current.source);
    }
    ghost.value = { title: current.title, x: event.clientX - current.offsetX, y: event.clientY - current.offsetY };

    const slotEl = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-board-slot]');
    if (slotEl) {
      const index = Number(slotEl.dataset.boardSlot);
      const direction = directionFromPointer(slotEl.getBoundingClientRect(), event.clientX, event.clientY, horizontal.value);
      if (index !== current.hover || direction !== current.direction) {
        current.hover = index;
        current.direction = direction;
        preview.value = placeTitle(baseline(current), current.title, index, direction);
      }
    } else if (current.hover !== null) {
      current.hover = null;
      current.direction = null;
      preview.value = baseline(current);
    }
    hoverIndex.value = current.hover;
  }

  function onUp(event: PointerEvent): void {
    const current = gesture;
    if (!current || event.pointerId !== current.pointerId) {
      return;
    }
    const drop = current.active && current.hover !== null ? preview.value : null;
    end();
    if (!current.active) {
      return;
    }
    // The browser still fires click when a drag ends on the button it started on; swallow only that one.
    suppressClick = true;
    suppressTimer = setTimeout(clearSuppress, 0);
    if (drop) {
      options.onDrop(drop);
    }
  }

  function onCancel(event: PointerEvent): void {
    if (gesture && event.pointerId === gesture.pointerId) {
      end();
    }
  }

  function end(): void {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    gesture = null;
    preview.value = null;
    hoverIndex.value = null;
    ghost.value = null;
    dragging.value = null;
  }

  function clearSuppress(): void {
    suppressClick = false;
    if (suppressTimer) {
      clearTimeout(suppressTimer);
      suppressTimer = null;
    }
  }

  /** True once, for the click that trails a finished drag. */
  function consumeSuppressedClick(): boolean {
    const suppressed = suppressClick;
    clearSuppress();
    return suppressed;
  }

  onUnmounted(() => {
    end();
    clearSuppress();
  });

  return { preview, hoverIndex, ghost, dragging, start, cancel: end, consumeSuppressedClick };
}
