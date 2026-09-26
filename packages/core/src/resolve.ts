import { parseColor, type Rgba } from './color.js';
import { type Drawn, resolveNumeric, resolveValue } from './descriptors.js';
import { type Curve, type Ease, linear, toEase } from './easing.js';
import { derive, keyOf } from './rng.js';
import type {
  BurstSpec,
  ChildSpec,
  ColorProperty,
  HeldParameter,
  LengthUnit,
  NumericProperty,
  ShapeKind,
  ShapeSpec,
} from './spec.js';
import { ANGLE, LENGTH, TIME, toNumber, UNITLESS, type Units } from './units.js';
import { validate } from './validate.js';

const DEFAULT_DURATION = 1;
const DEFAULT_COUNT = 5;
const DEFAULT_BURST_RADIUS: NumericProperty<LengthUnit> = [0, 50];
const DEFAULT_RADIUS = 50;
const DEFAULT_COLOR = 'deeppink';
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_INNER_RADIUS = 0.5;
// The kinds that enclose nothing, so are stroked rather than filled when the Spec says neither.
const STROKED: ReadonlySet<ShapeKind> = new Set(['cross', 'line', 'zigzag']);
const DEFAULT_SWIRL_SIZE = 10;
const DEFAULT_SWIRL_FREQUENCY = 1;
const STRAIGHT: readonly ResolvedSwirl[] = [];

/** Two or more Keyframes and the Ease that moves between them. */
export interface Tween<T> {
  readonly frames: readonly T[];
  readonly ease: Ease;
}

/**
 * A numeric property with every Descriptor resolved and every unit converted: a constant, or a
 * Tween.
 */
export type ResolvedNumeric = number | Tween<number>;

/**
 * A color property with every Descriptor resolved: a constant CSS color exactly as the Spec wrote
 * it, or a Tween of parsed colors.
 */
export type ResolvedColor = string | Tween<Rgba>;

/**
 * One Emitter in the resolved tree. Its radius runs on each Child's clock from that Child's start,
 * over `duration`: the longest time any Child runs, derived from its Children.
 */
export interface ResolvedEmitter {
  readonly radius: ResolvedNumeric;
  duration: number;
}

/**
 * Where one Emitter puts one Child: a unit direction from the Emitter's Origin. `emitter` indexes
 * the tree's `emitters`, so `sample()` evaluates each Emitter once per frame, not once per Element.
 */
export interface Placement {
  readonly emitter: number;
  /**
   * When the Child starts, in seconds from the Instance's start: the Emitter's radius runs from
   * then, for this Child.
   */
  readonly start: number;
  readonly dx: number;
  readonly dy: number;
  /** Every Swirl bending this throw, outermost first; empty for a straight one. */
  readonly swirls: readonly ResolvedSwirl[];
}

/**
 * One Swirl, turning a throw by `amplitude` × sin(`rate` × progress) radians clockwise, where
 * progress runs 0–1 along the throw.
 */
export interface ResolvedSwirl {
  readonly amplitude: number;
  readonly rate: number;
}

/**
 * One Element with concrete values for every property, and every Placement between it and the
 * Instance's Origin, outermost first.
 */
export interface ResolvedElement {
  readonly kind: ShapeKind;
  /** Seconds from the Instance's start to this Element's first frame. */
  readonly start: number;
  readonly duration: number;
  readonly radius: ResolvedNumeric;
  readonly angle: ResolvedNumeric;
  readonly scale: ResolvedNumeric;
  readonly opacity: ResolvedNumeric;
  readonly strokeWidth: ResolvedNumeric;
  readonly fill: ResolvedColor;
  readonly stroke: ResolvedColor;
  readonly placements: readonly Placement[];
  /** The kind's own parameters that hold still, by record field: set on its record once. */
  readonly held: { readonly [P in HeldParameter]?: number | string };
  /** The kind's own animated parameters other than `radius`, as record field and value. */
  readonly animated: readonly (readonly [string, ResolvedNumeric])[];
}

/** A Spec flattened into its Elements. Built once per Instance, never per frame. */
export interface ResolvedTree {
  /** The latest end across every Child, recursively (ADR-0016). */
  readonly duration: number;
  /** The progress of the Resting frame, 0 to 1 (ADR-0012). */
  readonly restAt: number;
  readonly elements: readonly ResolvedElement[];
  readonly emitters: readonly ResolvedEmitter[];
}

/** Resolve `spec` under `seed`, the Instance's Seed, after validating all of it. */
export function resolve(spec: ChildSpec, seed: number): ResolvedTree {
  validate(spec);
  const tree = { elements: [], emitters: [] };
  const root = seed >>> 0;
  const duration = walk(spec, root, 0, delayOf(spec, root, 0), [], tree);
  const restAt = spec.kind === 'swirl' ? 1 : (spec.restAt ?? 1);
  return { duration, restAt, ...tree };
}

/**
 * The numeric property `name` of the Child at `index` whose Seed is `seed`, in `units`. Each
 * property draws from its own Seed, derived from its name, so adding a property to a Spec leaves
 * the values of the others unchanged.
 */
function resolveNumbers(
  name: string,
  property: NumericProperty<string>,
  seed: number,
  index: number,
  units: Units,
): number | number[] {
  const drawn = resolveNumeric(property, derive(seed, keyOf(name)), index);
  const convert = (value: Drawn) =>
    // Validated: every unit here fits.
    typeof value === 'number' ? value : (toNumber(value, units) as number);
  return typeof drawn === 'object' ? drawn.map(convert) : convert(drawn);
}

/**
 * The `delay` of `spec`, the Child at `index` with Seed `seed`, in seconds. A Swirl adds no time, so
 * its delay is its Child's.
 */
function delayOf(spec: ChildSpec, seed: number, index: number): number {
  if (spec.kind === 'swirl') return delayOf(spec.child, seed, index);
  // A Distributable<NumericValue> holds no Keyframes, so it resolves to a number.
  return resolveNumbers('delay', spec.delay ?? 0, seed, index, TIME) as number;
}

/**
 * Append `spec`'s Elements and Emitters to `out` and return the latest end among them. `start` is
 * when `spec` starts, in seconds from the Instance's start, its own delay included.
 */
function walk(
  spec: ChildSpec,
  seed: number,
  index: number,
  start: number,
  placements: readonly Placement[],
  out: { elements: ResolvedElement[]; emitters: ResolvedEmitter[] },
): number {
  const numbers = (name: string, property: NumericProperty<string>, units: Units) =>
    resolveNumbers(name, property, seed, index, units);
  if (spec.kind === 'swirl') {
    const bending = placements.at(-1);
    // With no throw around it, a Swirl has nothing to bend.
    if (bending === undefined) return walk(spec.child, seed, index, start, placements, out);
    // Each Swirl on one throw draws its own values from a Seed of its own, so nested Swirls draw
    // apart. Its Child keeps this Seed and index, so wrapping it leaves every value it draws, other
    // than its position, unchanged.
    const own = derive(derive(seed, keyOf('swirl')), bending.swirls.length);
    // Neither holds Keyframes, so each resolves to a number.
    const size = resolveNumbers('size', spec.size ?? DEFAULT_SWIRL_SIZE, own, index, ANGLE);
    const frequency = resolveNumbers(
      'frequency',
      spec.frequency ?? DEFAULT_SWIRL_FREQUENCY,
      own,
      index,
      UNITLESS,
    );
    const swirl: ResolvedSwirl = {
      amplitude: resolveValue(spec.direction ?? 1, index) * (size as number) * (Math.PI / 180),
      rate: 2 * Math.PI * (frequency as number),
    };
    const bent = { ...bending, swirls: [...bending.swirls, swirl] };
    return walk(spec.child, seed, index, start, [...placements.slice(0, -1), bent], out);
  }
  const ease = easings(resolveValue(spec.easing ?? 'linear', index));
  const numeric = (name: string, property: NumericProperty<string>, units: Units) =>
    withEase(numbers(name, property, units), ease(name));
  const color = (name: string, property: ColorProperty) =>
    withEase(colors(property, index), ease(name));
  if (spec.kind !== 'burst') {
    // A Distributable<NumericValue> holds no Keyframes, so duration resolves to a number.
    const duration = numbers('duration', spec.duration ?? DEFAULT_DURATION, TIME) as number;
    const radius = numeric('radius', spec.radius ?? DEFAULT_RADIUS, LENGTH);
    const stroked = STROKED.has(spec.kind);
    const { held, animated } = kindParameters(spec, index, radius, numeric, ease);
    out.elements.push({
      kind: spec.kind,
      start,
      duration,
      radius,
      angle: numeric('angle', spec.angle ?? 0, ANGLE),
      scale: numeric('scale', spec.scale ?? 1, UNITLESS),
      opacity: numeric('opacity', spec.opacity ?? 1, UNITLESS),
      strokeWidth: numeric(
        'strokeWidth',
        spec.strokeWidth ?? (stroked ? DEFAULT_STROKE_WIDTH : 0),
        LENGTH,
      ),
      fill: color('fill', spec.fill ?? (stroked ? 'none' : DEFAULT_COLOR)),
      stroke: color('stroke', spec.stroke ?? (stroked ? DEFAULT_COLOR : 'none')),
      placements,
      held,
      animated,
    });
    return start + duration;
  }
  const emitter: ResolvedEmitter = {
    radius: numeric('radius', spec.radius ?? DEFAULT_BURST_RADIUS, LENGTH),
    duration: 0,
  };
  const emitterIndex = out.emitters.push(emitter) - 1;
  const count = spec.count ?? DEFAULT_COUNT;
  const offset = staggerOffsets(spec, seed, index, count);
  let end = start;
  for (let index = 0; index < count; index++) {
    // Each Child's Seed comes from this one and its index, so raising `count` leaves the Seeds of
    // the existing Children unchanged.
    const childSeed = derive(seed, index);
    const child = resolveValue(spec.children, index);
    const childStart = start + offset(index) + delayOf(child, childSeed, index);
    // Clockwise from 12 o'clock in a y-down space.
    const angle = (2 * Math.PI * index) / count;
    const placement: Placement = {
      emitter: emitterIndex,
      start: childStart,
      dx: Math.sin(angle),
      dy: -Math.cos(angle),
      swirls: STRAIGHT,
    };
    const childEnd = walk(child, childSeed, index, childStart, [...placements, placement], out);
    emitter.duration = Math.max(emitter.duration, childEnd - childStart);
    end = Math.max(end, childEnd);
  }
  return end;
}

/**
 * The parameters `spec`'s kind adds beyond `radius`, already resolved as `radius`, for the Child
 * at `index`. `numeric` resolves one animated parameter by name, and `ease` gives its Ease.
 */
function kindParameters(
  spec: ShapeSpec,
  index: number,
  radius: ResolvedNumeric,
  numeric: (name: string, property: NumericProperty<string>, units: Units) => ResolvedNumeric,
  ease: (name: string) => Ease,
): Pick<ResolvedElement, 'held' | 'animated'> {
  switch (spec.kind) {
    case 'circle':
    case 'cross':
    case 'line':
      return { held: {}, animated: [] };
    case 'polygon':
      return { held: { points: resolveValue(spec.points, index) }, animated: [] };
    case 'star': {
      const innerRadius = spec.innerRadius ?? DEFAULT_INNER_RADIUS;
      return {
        held: { points: resolveValue(spec.points, index) },
        animated: [['innerRadius', numeric('innerRadius', innerRadius, UNITLESS)]],
      };
    }
    case 'zigzag': {
      const amplitude =
        spec.amplitude === undefined
          ? scaled(radius, 1 / 4, ease('amplitude'))
          : numeric('amplitude', spec.amplitude, LENGTH);
      return {
        held: { points: resolveValue(spec.points, index) },
        animated: [['amplitude', amplitude]],
      };
    }
    case 'path':
      return { held: { d: resolveValue(spec.d, index) }, animated: [] };
  }
}

/** `property` times `factor`, through the same Keyframes along `ease`. */
function scaled(property: ResolvedNumeric, factor: number, ease: Ease): ResolvedNumeric {
  if (typeof property === 'number') return property * factor;
  return { frames: property.frames.map((frame) => frame * factor), ease };
}

/**
 * When each of the `count` Children of `spec`, the Burst at `index` with Seed `seed`, starts after
 * that Burst, by Child index, in seconds.
 */
function staggerOffsets(
  spec: BurstSpec,
  seed: number,
  index: number,
  count: number,
): (child: number) => number {
  const stagger = spec.stagger ?? 0;
  const eased = typeof stagger === 'object' && 'each' in stagger;
  const time = eased ? stagger.each : stagger;
  // A NumericValue holds no Keyframes, so it resolves to a number.
  const each = resolveNumbers('stagger', time, seed, index, TIME) as number;
  if (!eased || stagger.easing === undefined || count < 2) return (child) => each * child;
  // Validated: the Curve converts.
  const ease = toEase(stagger.easing) as Ease;
  const span = each * (count - 1);
  return (child) => span * Math.max(0, ease(child / (count - 1)));
}

/**
 * A color property for the Child at `index`. A constant passes through as written, so `none`
 * and `currentColor` still work; Keyframes are parsed into channels.
 */
function colors(property: ColorProperty, index: number): string | readonly Rgba[] {
  const value = resolveValue(property, index);
  if (typeof value === 'string') return value;
  // Validated: every Keyframe color parses.
  const frames = value.map((frame) => parseColor(frame) as Rgba);
  return frames.length === 1 ? value[0] : frames;
}

/** `value` as a constant, or, if it is Keyframes, as a Tween moving along `ease`. */
function withEase<C, F>(value: C | readonly F[], ease: Ease): C | Tween<F> {
  return Array.isArray(value) ? { frames: value as readonly F[], ease } : (value as C);
}

/** A Child's `easing`, already picked by `each()`, as the Ease of each property by name. */
function easings(
  easing: Curve | { readonly [name: string]: Curve | undefined },
): (name: string) => Ease {
  if (typeof easing !== 'object' || Array.isArray(easing)) {
    // Validated: every Curve converts.
    const ease = toEase(easing) as Ease;
    return () => ease;
  }
  const eases = new Map<string, Ease>();
  for (const [name, curve] of Object.entries(easing)) {
    if (curve !== undefined) eases.set(name, toEase(curve) as Ease);
  }
  const fallback = eases.get('default') ?? linear;
  return (name) => eases.get(name) ?? fallback;
}
