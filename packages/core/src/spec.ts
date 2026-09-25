import type { Distributable, RandDescriptor } from './descriptors.js';

/**
 * One number in a Spec: a constant, or a `rand()` resolved per Instance and per Child. Name it
 * when typing a helper that builds Specs and takes a number that may be random.
 */
export type NumericValue = number | RandDescriptor;

/** Two numbers animated from the first to the second over the Element's duration (ADR-0008). */
export type Keyframes = readonly [from: NumericValue, to: NumericValue];

/**
 * A numeric property: a value or Keyframes, either of which may be distributed across Children
 * with `each()`. Name it when typing a helper that builds Specs.
 */
export type NumericProperty = Distributable<NumericValue | Keyframes>;

/** The parameters each Element kind adds to the Spec. Adding a kind adds one entry here. */
interface ShapeParams {
  circle: { radius?: NumericProperty };
}

/** Every Element kind a `Shape` can draw. */
export type ShapeKind = keyof ShapeParams;

interface ShapeCommon {
  /** Seconds from the first frame to the last. */
  duration?: Distributable<NumericValue>;
  /** Degrees, clockwise. */
  angle?: NumericProperty;
  scale?: NumericProperty;
  opacity?: NumericProperty;
  fill?: Distributable<string>;
  stroke?: Distributable<string>;
  strokeWidth?: NumericProperty;
}

/**
 * The JSON-serializable description of one Element. Discriminated on `kind`, so each kind accepts
 * only its own parameters.
 */
export type ShapeSpec<K extends ShapeKind = ShapeKind> = {
  [P in K]: { kind: P } & ShapeParams[P] & ShapeCommon;
}[K];

/**
 * The JSON-serializable description of a Burst: `count` copies of one Child thrown outward around
 * the Origin. There is no duration: a Burst lasts as long as its longest-running Child.
 */
export interface BurstSpec {
  kind: 'burst';
  /** How many Children to spawn. */
  count?: number;
  /** Distance from the Origin to each Child. Animates over the Burst's duration. */
  radius?: NumericProperty;
  /** The Child spawned `count` times: an Element, or another Emitter. */
  children: ChildSpec;
}

/** Anything an Emitter can spawn. Discriminated on `kind`. */
export type ChildSpec = ShapeSpec | BurstSpec;
