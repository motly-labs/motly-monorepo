/**
 * `@motly/core/utils` — the small numeric helpers the engine and the adapters
 * share. Published as a subpath rather than a sixth package (see DECISIONS.md).
 */

/** Clamp `value` into the inclusive range [`min`, `max`]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation between `from` and `to` at progress `t` (0..1). */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
