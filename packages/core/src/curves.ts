import type { CubicBezier, PathCurve } from './easing.js';

// Named curves as data, so a Spec that uses one still serializes and an unused one tree-shakes
// out. Values are Robert Penner's easings as cubic-bezier approximations, the set Ceaser and
// Bourbon publish. Elastic and bounce cannot be a cubic-bezier, so they are path curves: bounce
// exactly, as the parabolas it is made of; elastic as cubics through Penner's formula, within 1e-3
// of it, tilted by up to 5e-4 so it starts at 0 and ends at 1 exactly.

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

/** Falls and bounces to rest at the end. Reach for it on something dropped into place. */
export const bounceOut: PathCurve =
  'M0,100 Q18.1818,100 36.3636,0 Q54.5455,50 72.7273,0 Q81.8182,12.5 90.9091,0 Q95.4545,3.125 100,0';

/** Bounces off the start before it leaves. Reach for it on something kicked away. */
export const bounceIn: PathCurve =
  'M0,100 Q4.5455,96.875 9.0909,100 Q18.1818,87.5 27.2727,100 Q45.4545,50 63.6364,100 Q81.8182,0 100,0';

/** Bounces off the start, then to rest at the end. Reach for it on a playful toggle. */
export const bounceInOut: PathCurve =
  'M0,100 Q2.2727,98.4375 4.5455,100 Q9.0909,93.75 13.6364,100 Q22.7273,75 31.8182,100 Q40.9091,50 50,50 Q59.0909,50 68.1818,0 Q77.2727,25 86.3636,0 Q90.9091,6.25 95.4545,0 Q97.7273,1.5625 100,0';

/** Overshoots and wobbles to rest, like a spring. Reach for it on a pop with character. */
export const elasticOut: PathCurve =
  'M0,100 C1.042,92.78 2.083,79.193 3.125,63.886 C3.646,56.233 4.167,48.15 4.688,40.147 C5.208,32.144 5.729,24.223 6.25,16.785 C6.771,9.348 7.292,2.394 7.813,-3.802 C8.333,-9.998 8.854,-15.436 9.375,-19.977 C9.896,-24.517 10.417,-28.161 10.938,-30.888 C11.458,-33.615 11.979,-35.427 12.5,-36.406 C13.542,-38.363 14.583,-36.947 15.625,-33.559 C16.667,-30.171 17.708,-24.867 18.75,-19.268 C19.792,-13.67 20.833,-7.811 21.875,-2.855 C22.917,2.101 23.958,6.149 25,8.851 C26.042,11.553 27.083,12.926 28.125,13.165 C29.167,13.404 30.208,12.533 31.25,11.087 C32.292,9.641 33.333,7.639 34.375,5.636 C35.417,3.633 36.458,1.639 37.5,0.018 C38.542,-1.603 39.583,-2.851 40.625,-3.624 C41.667,-4.396 42.708,-4.698 43.75,-4.634 C45.833,-4.505 47.917,-2.946 50,-1.538 C51.042,-0.834 52.083,-0.167 53.125,0.354 C54.167,0.875 55.208,1.251 56.25,1.46 C58.333,1.88 60.417,1.618 62.5,1.168 C64.583,0.718 66.667,0.139 68.75,-0.187 C70.833,-0.513 72.917,-0.597 75,-0.516 C77.083,-0.435 79.167,-0.218 81.25,-0.053 C83.333,0.112 85.417,0.221 87.5,0.244 C91.667,0.289 95.833,0.058 100,0';

/** Winds up with a growing wobble before it goes. Reach for it on a springy launch. */
export const elasticIn: PathCurve =
  'M0,100 C4.167,99.942 8.333,99.711 12.5,99.756 C14.583,99.779 16.667,99.888 18.75,100.053 C20.833,100.218 22.917,100.435 25,100.516 C27.083,100.597 29.167,100.513 31.25,100.187 C33.333,99.861 35.417,99.282 37.5,98.832 C39.583,98.382 41.667,98.12 43.75,98.54 C44.792,98.749 45.833,99.125 46.875,99.646 C47.917,100.167 48.958,100.834 50,101.538 C52.083,102.946 54.167,104.505 56.25,104.634 C57.292,104.698 58.333,104.396 59.375,103.624 C60.417,102.851 61.458,101.603 62.5,99.982 C63.542,98.361 64.583,96.367 65.625,94.364 C66.667,92.361 67.708,90.359 68.75,88.913 C69.792,87.467 70.833,86.596 71.875,86.835 C72.917,87.074 73.958,88.447 75,91.149 C76.042,93.851 77.083,97.899 78.125,102.855 C79.167,107.811 80.208,113.67 81.25,119.268 C82.292,124.867 83.333,130.171 84.375,133.559 C85.417,136.947 86.458,138.363 87.5,136.406 C88.021,135.427 88.542,133.615 89.063,130.888 C89.583,128.161 90.104,124.517 90.625,119.977 C91.146,115.436 91.667,109.998 92.188,103.802 C92.708,97.606 93.229,90.652 93.75,83.215 C94.271,75.777 94.792,67.856 95.313,59.853 C95.833,51.85 96.354,43.767 96.875,36.114 C97.917,20.807 98.958,7.22 100,0';

/** Wobbles out of the start and into the end. Reach for it on a springy swap. */
export const elasticInOut: PathCurve =
  'M0,100 C2.083,99.969 4.167,99.907 6.25,99.898 C8.333,99.89 10.417,99.966 12.5,100.144 C14.583,100.323 16.667,100.609 18.75,100.509 C19.792,100.458 20.833,100.3 21.875,100.005 C22.917,99.71 23.958,99.272 25,98.807 C27.083,97.877 29.167,96.81 31.25,98.145 C32.292,98.813 33.333,100.113 34.375,101.963 C35.417,103.812 36.458,106.229 37.5,108.308 C38.542,110.387 39.583,112.085 40.625,111.807 C41.146,111.668 41.667,111.027 42.188,109.711 C42.708,108.395 43.229,106.399 43.75,103.652 C44.271,100.904 44.792,97.4 45.313,93.244 C45.833,89.088 46.354,84.278 46.875,79.161 C47.396,74.044 47.917,68.62 48.438,63.51 C48.958,58.401 49.479,53.61 50,50 C50.521,46.39 51.042,41.599 51.563,36.49 C52.083,31.38 52.604,25.956 53.125,20.839 C53.646,15.722 54.167,10.912 54.688,6.756 C55.208,2.6 55.729,-0.904 56.25,-3.652 C56.771,-6.399 57.292,-8.395 57.813,-9.711 C58.333,-11.027 58.854,-11.668 59.375,-11.807 C60.417,-12.085 61.458,-10.387 62.5,-8.308 C63.542,-6.229 64.583,-3.812 65.625,-1.963 C66.667,-0.113 67.708,1.187 68.75,1.855 C70.833,3.19 72.917,2.123 75,1.193 C76.042,0.728 77.083,0.29 78.125,-0.005 C79.167,-0.3 80.208,-0.458 81.25,-0.509 C83.333,-0.609 85.417,-0.323 87.5,-0.144 C89.583,0.034 91.667,0.11 93.75,0.102 C95.833,0.093 97.917,0.031 100,0';
