/**
 * A cubic-bezier as CSS writes it, `cubic-bezier(x1, y1, x2, y2)`; both x in 0–1. Paste one from a
 * design tool when no named curve fits.
 */
export type CubicBezier = readonly [x1: number, y1: number, x2: number, y2: number];

/** The CSS easing keywords: the only curves a Spec names with a string. Reach for one to match CSS. */
export type CssEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

/**
 * A curve from progress to eased progress, held in a Spec as data: a CSS keyword, or a
 * cubic-bezier as four numbers. Named curves such as `quadOut` are cubic-beziers you import. Name
 * it when typing a helper that takes a curve.
 */
export type Curve = CssEasing | CubicBezier;

/** A resolved curve: progress 0–1 to eased progress, which may overshoot. */
export type Ease = (progress: number) => number;

const KEYWORDS: Readonly<Record<Exclude<CssEasing, 'linear'>, CubicBezier>> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};

/** The curve that leaves progress as it is. */
export const linear: Ease = (progress) => progress;

// Solve for t to this precision, not for x: where the curve is near vertical, a tiny error in x
// is a large one in y.
const PRECISION = 1e-12;

/** The curve `cubic-bezier(x1, y1, x2, y2)`, solved as browsers solve it: Newton, then bisection. */
function cubicBezier([x1, y1, x2, y2]: CubicBezier): Ease {
  if (x1 === y1 && x2 === y2) return linear;
  // Each axis as a polynomial a·t³ + b·t² + c·t.
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const xAt = (t: number) => ((ax * t + bx) * t + cx) * t;
  const yAt = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeAt = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  function solve(x: number): number {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const slope = slopeAt(t);
      if (Math.abs(slope) < 1e-6) break;
      const step = (xAt(t) - x) / slope;
      t -= step;
      if (t < 0 || t > 1) break;
      if (Math.abs(step) < PRECISION) return t;
    }
    // x(t) rises monotonically over 0–1 because both x control points lie in 0–1.
    let low = 0;
    let high = 1;
    while (high - low > PRECISION) {
      t = (low + high) / 2;
      const at = xAt(t);
      // Where x(t) is flat, rounding noise swamps it: stop on an exact hit rather than drift.
      if (at === x) return t;
      if (at < x) low = t;
      else high = t;
    }
    return (low + high) / 2;
  }

  return (progress) => (progress <= 0 ? 0 : progress >= 1 ? 1 : yAt(solve(progress)));
}

function isCubicBezier(curve: unknown): curve is CubicBezier {
  return (
    Array.isArray(curve) &&
    curve.length === 4 &&
    curve.every(Number.isFinite) &&
    curve[0] >= 0 &&
    curve[0] <= 1 &&
    curve[2] >= 0 &&
    curve[2] <= 1
  );
}

/** `curve` as a function. Throws, naming property `name`, for anything that is not a Curve. */
export function toEase(curve: Curve, name: string): Ease {
  if (curve === 'linear') return linear;
  if (typeof curve === 'string' && Object.hasOwn(KEYWORDS, curve)) {
    return cubicBezier(KEYWORDS[curve as keyof typeof KEYWORDS]);
  }
  if (isCubicBezier(curve)) return cubicBezier(curve);
  const shown = typeof curve === 'string' ? `'${curve}'` : JSON.stringify(curve);
  throw new Error(
    `motly: ${name} cannot be ${shown}. Use a CSS easing keyword, four cubic-bezier numbers ` +
      'with both x in 0–1, or an imported named curve.',
  );
}
