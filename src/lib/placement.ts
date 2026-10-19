export type Slots = (string | null)[];
/** 1 shifts occupants toward higher indices, −1 toward lower ones. */
export type Direction = 1 | -1;

/**
 * Places `title` at `index` and returns the new board. An occupied target pushes its neighbours toward the
 * nearest empty slot in `direction`, falling back to the other direction when that side is full.
 */
export function placeTitle(slots: readonly (string | null)[], title: string, index: number, direction: Direction): Slots {
  const next = slots.slice();
  if (next[index] == null) {
    next[index] = title;
    return next;
  }
  if (!shiftInto(next, title, index, direction)) {
    shiftInto(next, title, index, -direction as Direction);
  }
  return next;
}

function shiftInto(slots: Slots, title: string, index: number, direction: Direction): boolean {
  for (let i = index; i >= 0 && i < slots.length; i += direction) {
    if (slots[i] == null) {
      for (let j = i; j !== index; j -= direction) {
        slots[j] = slots[j - direction] ?? null;
      }
      slots[index] = title;
      return true;
    }
  }
  return false;
}

/**
 * The shift direction for a pointer over a slot: on the slot's far half (right, or bottom when the board is
 * stacked) the occupant moves toward lower indices, so the dropped card lands after it.
 */
export function directionFromPointer(rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>, x: number, y: number, horizontal: boolean): Direction {
  if (horizontal) {
    return rect.right - x < x - rect.left ? -1 : 1;
  }
  return rect.bottom - y < y - rect.top ? -1 : 1;
}
