import type { CubicBezier } from './easing.js';

// Named curves as cubic-bezier data, so a Spec that uses one still serializes to numbers and an
// unused one tree-shakes out. Values are Robert Penner's easings as cubic-bezier approximations,
// the set Ceaser and Bourbon publish. Elastic and bounce cannot be a cubic-bezier.

/** Speeds up very gently. Reach for it on motion leaving or fading out. */
export const sineIn = [0.47, 0, 0.745, 0.715] as const satisfies CubicBezier;

/** Slows down very gently. Reach for it on motion arriving or thrown outward. */
export const sineOut = [0.39, 0.575, 0.565, 1] as const satisfies CubicBezier;

/** Speeds up, then slows down, very gently. Reach for it on motion that starts and stops in view. */
export const sineInOut = [0.445, 0.05, 0.55, 0.95] as const satisfies CubicBezier;

/** Speeds up gently. Reach for it on motion leaving or fading out. */
export const quadIn = [0.55, 0.085, 0.68, 0.53] as const satisfies CubicBezier;

/** Slows down gently. Reach for it on motion arriving or thrown outward. */
export const quadOut = [0.25, 0.46, 0.45, 0.94] as const satisfies CubicBezier;

/** Speeds up, then slows down, gently. Reach for it on motion that starts and stops in view. */
export const quadInOut = [0.455, 0.03, 0.515, 0.955] as const satisfies CubicBezier;

/** Speeds up moderately. Reach for it on motion leaving or fading out. */
export const cubicIn = [0.55, 0.055, 0.675, 0.19] as const satisfies CubicBezier;

/** Slows down moderately. Reach for it on motion arriving or thrown outward. */
export const cubicOut = [0.215, 0.61, 0.355, 1] as const satisfies CubicBezier;

/** Speeds up, then slows down, moderately. Reach for it on motion that starts and stops in view. */
export const cubicInOut = [0.645, 0.045, 0.355, 1] as const satisfies CubicBezier;

/** Speeds up strongly. Reach for it on motion leaving or fading out. */
export const quartIn = [0.895, 0.03, 0.685, 0.22] as const satisfies CubicBezier;

/** Slows down strongly. Reach for it on motion arriving or thrown outward. */
export const quartOut = [0.165, 0.84, 0.44, 1] as const satisfies CubicBezier;

/** Speeds up, then slows down, strongly. Reach for it on motion that starts and stops in view. */
export const quartInOut = [0.77, 0, 0.175, 1] as const satisfies CubicBezier;

/** Speeds up very strongly. Reach for it on motion leaving or fading out. */
export const quintIn = [0.755, 0.05, 0.855, 0.06] as const satisfies CubicBezier;

/** Slows down very strongly. Reach for it on motion arriving or thrown outward. */
export const quintOut = [0.23, 1, 0.32, 1] as const satisfies CubicBezier;

/** Speeds up, then slows down, very strongly. Reach for it on motion that starts and stops in view. */
export const quintInOut = [0.86, 0, 0.07, 1] as const satisfies CubicBezier;

/** Speeds up sharply. Reach for it on motion leaving or fading out. */
export const expoIn = [0.95, 0.05, 0.795, 0.035] as const satisfies CubicBezier;

/** Slows down sharply. Reach for it on motion arriving or thrown outward. */
export const expoOut = [0.19, 1, 0.22, 1] as const satisfies CubicBezier;

/** Speeds up, then slows down, sharply. Reach for it on motion that starts and stops in view. */
export const expoInOut = [1, 0, 0, 1] as const satisfies CubicBezier;

/** Speeds up along a quarter circle. Reach for it on motion leaving or fading out. */
export const circIn = [0.6, 0.04, 0.98, 0.335] as const satisfies CubicBezier;

/** Slows down along a quarter circle. Reach for it on motion arriving or thrown outward. */
export const circOut = [0.075, 0.82, 0.165, 1] as const satisfies CubicBezier;

/** Speeds up, then slows down, along a quarter circle. Reach for it on motion that starts and stops in view. */
export const circInOut = [0.785, 0.135, 0.15, 0.86] as const satisfies CubicBezier;

/** Pulls back before it goes. Reach for it on a wind-up. */
export const backIn = [0.6, -0.28, 0.735, 0.045] as const satisfies CubicBezier;

/** Overshoots the end, then settles. Reach for it on a pop. */
export const backOut = [0.175, 0.885, 0.32, 1.275] as const satisfies CubicBezier;

/** Pulls back, then overshoots. Reach for it on a playful swap. */
export const backInOut = [0.68, -0.55, 0.265, 1.55] as const satisfies CubicBezier;
