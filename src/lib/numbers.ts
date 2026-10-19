/** Keeps `digits` significant digits of a non-negative integer, rounding half up (with 3: 1235 → 1240, 999,999 → 1,000,000). */
export function roundToSignificant(value: number, digits: number): number {
  const excess = String(value).length - digits;
  if (excess <= 0) {
    return value;
  }
  const factor = 10 ** excess;
  return Math.round(value / factor) * factor;
}
