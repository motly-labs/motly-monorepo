import { mixColor } from './color.js';
import type { ResolvedColor, ResolvedNumeric } from './resolve.js';
import { clamp, lerp } from './utils/index.js';

/**
 * Keyframes `frames`, two or more, spread evenly over progress 0–1, mixed at `progress`. Progress
 * past either end, from a curve that overshoots, carries on along the first or last pair.
 */
function keyframesAt<T, U>(
  frames: readonly T[],
  progress: number,
  mix: (from: T, to: T, progress: number) => U,
): U {
  const position = progress * (frames.length - 1);
  const index = clamp(Math.floor(position), 0, frames.length - 2);
  return mix(frames[index] as T, frames[index + 1] as T, position - index);
}

/** A resolved numeric property at linear `progress` through its duration, eased. */
export function numberAt(property: ResolvedNumeric, progress: number): number {
  return typeof property === 'number'
    ? property
    : keyframesAt(property.frames, property.ease(progress), lerp);
}

/** A resolved color property at linear `progress` through its duration, eased. */
export function colorAt(property: ResolvedColor, progress: number): string {
  return typeof property === 'string'
    ? property
    : keyframesAt(property.frames, property.ease(progress), mixColor);
}
