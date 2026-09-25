import type { Distributable, RandDescriptor } from './descriptors.js';
import type { Curve } from './easing.js';
import type { ANGLE, LENGTH, TIME } from './units.js';

/** Units a length accepts; a plain number is px. Name it to type a helper's length parameter. */
export type LengthUnit = keyof typeof LENGTH;
/** Units an angle accepts; a plain number is degrees. Name it to type a helper's angle parameter. */
export type AngleUnit = keyof typeof ANGLE;
/** Units a duration accepts; a plain number is seconds. Name it to type a helper's duration. */
export type TimeUnit = keyof typeof TIME;

/**
 * One number in a Spec: a constant, a string with one of the units `U` (`'90deg'`), or a `rand()`
 * resolved per Instance and per Child. Name it when typing a helper that builds Specs and takes a
 * number that may be random.
 */
export type NumericValue<U extends string = never> = number | `${number}${U}` | RandDescriptor;

/**
 * Successive values spread evenly over the Element's duration (ADR-0008). Name it when typing a
 * helper that builds Specs. There is no `{ from: to }` delta syntax (ADR-0017).
 */
export type Keyframes<V> = readonly [V, ...V[]];

/**
 * A numeric property taking units `U`: a value or Keyframes, either of which may be distributed
 * across Children with `each()`. Name it when typing a helper that builds Specs.
 */
export type NumericProperty<U extends string = never> = Distributable<
  NumericValue<U> | Keyframes<NumericValue<U>>
>;

/**
 * A color property: any CSS color, or Keyframes of named, hex, `rgb()` or `rgba()` colors, either
 * of which may be distributed across Children with `each()`. Name it when typing a helper that
 * builds Specs.
 */
export type ColorProperty = Distributable<string | Keyframes<string>>;

/**
 * How a Spec's animated properties move between their Keyframes: one Curve for all of them, or a
 * Curve per property name `P`, with `default` for the rest. Linear when left out. Either may be
 * distributed across Children with `each()`. Name it when typing a helper that builds Specs.
 */
export type Easing<P extends string> = Distributable<Curve | { [N in P | 'default']?: Curve }>;

/** The parameters each Element kind adds to the Spec. Adding a kind adds one entry here. */
interface ShapeParams {
  circle: { radius?: NumericProperty<LengthUnit> };
}

/** Every Element kind a `Shape` can draw. */
export type ShapeKind = keyof ShapeParams;

interface ShapeCommon {
  /** Time from the first frame to the last. */
  duration?: Distributable<NumericValue<TimeUnit>>;
  /** Clockwise. */
  angle?: NumericProperty<AngleUnit>;
  scale?: NumericProperty;
  opacity?: NumericProperty;
  fill?: ColorProperty;
  stroke?: ColorProperty;
  strokeWidth?: NumericProperty<LengthUnit>;
}

/**
 * The JSON-serializable description of one Element. Discriminated on `kind`, so each kind accepts
 * only its own parameters.
 */
export type ShapeSpec<K extends ShapeKind = ShapeKind> = {
  [P in K]: { kind: P } & ShapeParams[P] & ShapeCommon & { easing?: Easing<ShapeProperty<P>> };
}[K];

/** The animated properties of a Shape of kind `K`: what its `easing` map is keyed by. */
type ShapeProperty<K extends ShapeKind> = Exclude<
  keyof (ShapeParams[K] & ShapeCommon),
  'duration'
> &
  string;

/**
 * The JSON-serializable description of a Burst: `count` copies of one Child thrown outward around
 * the Origin. There is no duration: a Burst lasts as long as its longest-running Child.
 */
export interface BurstSpec {
  kind: 'burst';
  /** How many Children to spawn. */
  count?: number;
  /** Distance from the Origin to each Child. Animates over the Burst's duration. */
  radius?: NumericProperty<LengthUnit>;
  /** How the Burst's own `radius` moves. Its Children take their own `easing`. */
  easing?: Easing<'radius'>;
  /** The Child spawned `count` times: an Element, or another Emitter. */
  children: ChildSpec;
}

/** Anything an Emitter can spawn. Discriminated on `kind`. */
export type ChildSpec = ShapeSpec | BurstSpec;
