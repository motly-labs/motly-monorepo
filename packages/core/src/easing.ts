/**
 * A cubic-bezier as CSS writes it, `cubic-bezier(x1, y1, x2, y2)`; both x in 0–1. Paste one from a
 * design tool when no named curve fits.
 */
export type CubicBezier = readonly [x1: number, y1: number, x2: number, y2: number];

/** The CSS easing keywords: the only curves a Spec names with a string. Reach for one to match CSS. */
export type CssEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

/**
 * A curve drawn in a design tool, as an SVG path `d` in a 100×100 box, the way mojs takes it: x is
 * progress from 0 to 100, y runs down, so `M0,100` is the start and `100,0` is full travel. Paste
 * one when the curve has more than one bend, or overshoots more than once.
 */
export type PathCurve = `M${string}`;

/**
 * A curve from progress to eased progress, held in a Spec as data: a CSS keyword, a cubic-bezier
 * as four numbers, or an SVG path string. Named curves such as `quadOut` or `bounceOut` are
 * constants you import that hold one of these. Name it when typing a helper that takes a curve.
 */
export type Curve = CssEasing | CubicBezier | PathCurve;

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

/** One axis of a cubic Bézier through p0–p3, as a·t³ + b·t² + c·t + d. */
type Cubic = readonly [a: number, b: number, c: number, d: number];

function cubic(p0: number, p1: number, p2: number, p3: number): Cubic {
  return [3 * (p1 - p2) + p3 - p0, 3 * (p0 - 2 * p1 + p2), 3 * (p1 - p0), p0];
}

const valueAt = ([a, b, c, d]: Cubic, t: number) => ((a * t + b) * t + c) * t + d;
const slopeAt = ([a, b, c]: Cubic, t: number) => (3 * a * t + 2 * b) * t + c;

/** The t at which `axis`, which rises monotonically over 0–1, reaches `x`: Newton, then bisection. */
function solve(axis: Cubic, x: number): number {
  const start = axis[3];
  const width = valueAt(axis, 1) - start;
  let t = width > 0 ? (x - start) / width : 0;
  for (let i = 0; i < 8; i++) {
    const slope = slopeAt(axis, t);
    if (Math.abs(slope) < 1e-6) break;
    const step = (valueAt(axis, t) - x) / slope;
    t -= step;
    if (t < 0 || t > 1) break;
    if (Math.abs(step) < PRECISION) return t;
  }
  let low = 0;
  let high = 1;
  while (high - low > PRECISION) {
    t = (low + high) / 2;
    const at = valueAt(axis, t);
    // Where x(t) is flat, rounding noise swamps it: stop on an exact hit rather than drift.
    if (at === x) return t;
    if (at < x) low = t;
    else high = t;
  }
  return (low + high) / 2;
}

/**
 * `ease`, remembering its last answer. Every property of a Child shares one Ease and is sampled at
 * one progress, so this is one solve per Child per frame instead of one per property.
 */
function remembered(ease: Ease): Ease {
  let lastProgress = Number.NaN;
  let lastEased = Number.NaN;
  return (progress) => {
    if (progress === lastProgress) return lastEased;
    lastProgress = progress;
    lastEased = ease(progress);
    return lastEased;
  };
}

/** The curve `cubic-bezier(x1, y1, x2, y2)`, solved as browsers solve it. */
function cubicBezier([x1, y1, x2, y2]: CubicBezier): Ease {
  if (x1 === y1 && x2 === y2) return linear;
  // x(t) rises monotonically over 0–1 because both x control points lie in 0–1.
  const x = cubic(0, x1, x2, 1);
  const y = cubic(0, y1, y2, 1);
  return remembered((progress) =>
    progress <= 0 ? 0 : progress >= 1 ? 1 : valueAt(y, solve(x, progress)),
  );
}

/** One cubic segment of a path, in box units: its start, two control points and end. */
type Segment = readonly [
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
];

// A command letter, or a number in any form SVG allows (`-.5`, `1e-3`), or separators.
const TOKEN = /([a-zA-Z])|([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)|([\s,]+)|(.)/g;

/** The number of arguments each command takes. Arcs are left out: redraw one with C. */
const ARITY: Readonly<Record<string, number>> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2 };

type Point = readonly [x: number, y: number];

/** The path `d` as cubic segments in box units, or why it is not a curve. */
function parsePath(d: string): Segment[] | string {
  const tokens: (string | number)[] = [];
  for (const [, letter, number, , other] of d.matchAll(TOKEN)) {
    if (letter !== undefined) tokens.push(letter);
    else if (number !== undefined) {
      if (!Number.isFinite(Number(number))) return `'${number}' is not a finite number.`;
      tokens.push(Number(number));
    } else if (other !== undefined) return `'${other}' has no place in a path.`;
  }
  const segments: Segment[] = [];
  let x = 0;
  let y = 0;
  const curveTo = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    segments.push([x, y, x1, y1, x2, y2, x3, y3]);
    x = x3;
    y = y3;
  };
  // The cubic with the same shape: each control point two thirds of the way to (qx, qy).
  const quadTo = (qx: number, qy: number, x3: number, y3: number) =>
    curveTo(
      x + (2 / 3) * (qx - x),
      y + (2 / 3) * (qy - y),
      x3 + (2 / 3) * (qx - x3),
      y3 + (2 / 3) * (qy - y3),
      x3,
      y3,
    );
  // The last control point of the previous command, if it was a cubic or a quadratic: S and T
  // reflect it through the current point.
  let cubicControl: Point | undefined;
  let quadControl: Point | undefined;
  const reflect = (control: Point | undefined): Point =>
    control === undefined ? [x, y] : [2 * x - control[0], 2 * y - control[1]];

  let command = '';
  let moved = false;
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (typeof token === 'string') {
      command = token;
      i++;
    }
    const absolute = command.toUpperCase();
    if (absolute === 'Z') return 'A path curve runs one way in x, so it cannot close with Z.';
    if (absolute === 'A') return 'A path curve cannot use arcs (A). Redraw the arc with C.';
    const arity = ARITY[absolute];
    if (arity === undefined) return `'${command}' is not a path command.`;
    const args = tokens.slice(i, i + arity);
    if (args.length < arity || !args.every((arg) => typeof arg === 'number')) {
      return `'${command}' takes ${arity} numbers.`;
    }
    i += arity;
    // Relative commands measure from the current point.
    const n = (args as number[]).map((value, index) =>
      command === absolute ? value : value + (absolute === 'V' || index % 2 === 1 ? y : x),
    );
    const [a = 0, b = 0, c = 0, e = 0, f = 0, g = 0] = n;
    const previousCubic = cubicControl;
    const previousQuad = quadControl;
    cubicControl = undefined;
    quadControl = undefined;
    switch (absolute) {
      case 'M':
        if (moved) return 'A path curve is one unbroken line, so it cannot move with M again.';
        moved = true;
        x = a;
        y = b;
        // Pairs after a move are lines.
        command = command === 'M' ? 'L' : 'l';
        break;
      case 'L':
        curveTo(x + (a - x) / 3, y + (b - y) / 3, a - (a - x) / 3, b - (b - y) / 3, a, b);
        break;
      case 'H':
        curveTo(x + (a - x) / 3, y, a - (a - x) / 3, y, a, y);
        break;
      case 'V':
        curveTo(x, y + (a - y) / 3, x, a - (a - y) / 3, x, a);
        break;
      case 'C':
        curveTo(a, b, c, e, f, g);
        cubicControl = [c, e];
        break;
      case 'S': {
        const [x1, y1] = reflect(previousCubic);
        curveTo(x1, y1, a, b, c, e);
        cubicControl = [a, b];
        break;
      }
      case 'Q':
        quadTo(a, b, c, e);
        quadControl = [a, b];
        break;
      case 'T': {
        const control = reflect(previousQuad);
        quadTo(...control, a, b);
        quadControl = control;
        break;
      }
    }
  }
  return checkPath(segments);
}

/** `segments`, if they run from x 0 to x 100 without turning back, or why not. */
function checkPath(segments: Segment[]): Segment[] | string {
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (first === undefined || last === undefined) return 'The path draws nothing after its M.';
  // Relative commands sum in floating point, so an end a rounding error away still counts.
  if (Math.abs(first[0]) > 1e-9) return `A path curve must start at x 0, not ${first[0]}.`;
  if (Math.abs(last[6] - 100) > 1e-9) return `A path curve must end at x 100, not ${last[6]}.`;
  for (const [x0, , x1, , x2, , x3, y3] of segments) {
    // x′(t) = 3a·t² + 2b·t + c must not dip below 0: check both ends and the turning point.
    const [a, b, c] = cubic(x0, x1, x2, x3);
    const vertex = -b / (3 * a);
    const lowest = Math.min(
      c,
      3 * a + 2 * b + c,
      a !== 0 && vertex > 0 && vertex < 1 ? c - (b * b) / (3 * a) : c,
    );
    if (lowest < -1e-9) {
      return `A path curve never turns back in x, but the segment ending at (${x3}, ${y3}) does.`;
    }
  }
  return segments;
}

/** Why `d` is not a path curve, or `undefined` if it is one. */
export function pathProblem(d: string): string | undefined {
  const segments = parsePath(d);
  return typeof segments === 'string' ? segments : undefined;
}

/** One segment in progress units: where it starts in x, and each axis as a cubic in t. */
interface Piece {
  readonly start: number;
  readonly x: Cubic;
  readonly y: Cubic;
}

/** A path curve in the 100×100 box, y down, as an Ease. */
function pathCurve(segments: readonly Segment[]): Ease {
  const pieces = segments.map(
    ([x0, y0, x1, y1, x2, y2, x3, y3]): Piece => ({
      start: x0 / 100,
      x: cubic(x0 / 100, x1 / 100, x2 / 100, x3 / 100),
      y: cubic(1 - y0 / 100, 1 - y1 / 100, 1 - y2 / 100, 1 - y3 / 100),
    }),
  );
  // checkPath guarantees at least one.
  const first = pieces[0] as Piece;
  const last = pieces[pieces.length - 1] as Piece;
  return remembered((progress) => {
    if (progress <= 0) return valueAt(first.y, 0);
    if (progress >= 1) return valueAt(last.y, 1);
    // The last piece that starts at or before progress: at a vertical step, the one after it.
    let index = pieces.length - 1;
    while (index > 0 && (pieces[index] as Piece).start > progress) index--;
    const piece = pieces[index] as Piece;
    return valueAt(piece.y, solve(piece.x, progress));
  });
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

/** `curve` as a function, or `undefined` if it is not a Curve. */
export function toEase(curve: unknown): Ease | undefined {
  if (curve === 'linear') return linear;
  if (typeof curve === 'string' && Object.hasOwn(KEYWORDS, curve)) {
    return cubicBezier(KEYWORDS[curve as keyof typeof KEYWORDS]);
  }
  if (isCubicBezier(curve)) return cubicBezier(curve);
  if (typeof curve === 'string' && curve.startsWith('M')) {
    const segments = parsePath(curve);
    if (typeof segments !== 'string') return pathCurve(segments);
  }
  return undefined;
}
