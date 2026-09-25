/**
 * A numeric property: a constant, or two Keyframes animated from the first value to the second
 * over the Element's duration.
 */
export type NumericProperty = number | readonly [from: number, to: number];

/** The parameters each Element kind adds to the Spec. Adding a kind adds one entry here. */
interface ShapeParams {
  circle: { radius?: NumericProperty };
}

/** Every Element kind a `Shape` can draw. */
export type ShapeKind = keyof ShapeParams;

interface ShapeCommon {
  /** Seconds from the first frame to the last. */
  duration?: number;
  /** Degrees, clockwise. */
  angle?: NumericProperty;
  scale?: NumericProperty;
  opacity?: NumericProperty;
  fill?: string;
  stroke?: string;
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
