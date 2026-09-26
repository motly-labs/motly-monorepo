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

/**
 * The parameters each Element kind adds to the Spec. Every kind is drawn centred on its position
 * and, at `angle` 0, pointing at 12 o'clock. Adding a kind adds one entry here.
 */
interface ShapeParams {
  /** Reach for it for dots, rings (with `fill: 'none'` and a stroke) and ripples. */
  circle: {
    radius?: NumericProperty<LengthUnit>;
  };
  /** Reach for it for triangles, squares and hexagons: any regular shape with straight sides. */
  polygon: {
    /** From the centre to each corner. */
    radius?: NumericProperty<LengthUnit>;
    /** How many corners, 3 or more. The first is at 12 o'clock. */
    points: Distributable<number>;
  };
  /** Reach for it for sparkles and celebration bursts. */
  star: {
    /** From the centre to each tip. */
    radius?: NumericProperty<LengthUnit>;
    /** How many tips, 2 or more. The first is at 12 o'clock. */
    points: Distributable<number>;
    /**
     * How far in the notches between tips sit, as a fraction of `radius`: 0 is spikes, 1 a polygon
     * with twice the corners. As a fraction, a star keeps its shape while `radius` animates.
     */
    innerRadius?: NumericProperty;
  };
  /** Reach for it for a plus sign, or turned 45° for an x. Stroked, as it encloses nothing. */
  cross: {
    /** From the centre to the end of each arm. */
    radius?: NumericProperty<LengthUnit>;
  };
  /** Reach for it for streaks and rays: turn it with `angle`. Stroked, as it encloses nothing. */
  line: {
    /** From the centre to each end. The line runs from 12 o'clock to 6. */
    radius?: NumericProperty<LengthUnit>;
  };
  /** Reach for it for sparks and squiggles. Stroked, as it encloses nothing. */
  zigzag: {
    /** From the centre to each end. The zigzag runs from 12 o'clock to 6. */
    radius?: NumericProperty<LengthUnit>;
    /** How many corners, ends included, 2 or more, evenly spaced along the length. */
    points: Distributable<number>;
    /** How far each corner between the ends swings to either side. A quarter of `radius` if left out. */
    amplitude?: NumericProperty<LengthUnit>;
  };
  /** Reach for it for any outline the other kinds do not draw, such as a heart. */
  path: {
    /** An SVG path, drawn in a 100×100 box centred on (50, 50), as copied out of a design tool. */
    d: Distributable<string>;
    /** Half the width of that box, once drawn: 50 draws the path at the size it was written. */
    radius?: NumericProperty<LengthUnit>;
  };
}

/** Every Element kind a `Shape` can draw. */
export type ShapeKind = keyof ShapeParams;

interface ShapeCommon {
  /** Time from the first frame to the last. */
  duration?: Distributable<NumericValue<TimeUnit>>;
  /**
   * Time to wait before the first frame, held until then. Reach for it to offset one Child, or a
   * few with `each()`; use a Burst's `stagger` to offset all of them in turn.
   */
  delay?: Distributable<NumericValue<TimeUnit>>;
  /** Clockwise. */
  angle?: NumericProperty<AngleUnit>;
  scale?: NumericProperty;
  opacity?: NumericProperty;
  /**
   * Deeppink if left out, except on a cross, line or zigzag, which enclose nothing: none there.
   * Each style field left out takes its kind's default, whatever the others say.
   */
  fill?: ColorProperty;
  /** None if left out, except on a cross, line or zigzag: deeppink there, so they show. */
  stroke?: ColorProperty;
  /** 0 if left out, except on a cross, line or zigzag: 2 there. */
  strokeWidth?: NumericProperty<LengthUnit>;
}

/**
 * The JSON-serializable description of one Element. Discriminated on `kind`, so each kind accepts
 * only its own parameters.
 */
export type ShapeSpec<K extends ShapeKind = ShapeKind> = {
  [P in K]: { kind: P } & ShapeParams[P] &
    ForeignParams<P> &
    ShapeCommon & { easing?: Easing<ShapeProperty<P>> };
}[K];

/**
 * The other kinds' parameters, each marked absent on kind `K`. A circle then rejects `points` even
 * where the compiler looks for no extra fields, as inside `each([...])`.
 */
type ForeignParams<K extends ShapeKind> = {
  [F in Exclude<
    { [P in ShapeKind]: keyof ShapeParams[P] }[ShapeKind],
    keyof ShapeParams[K]
  >]?: never;
};

/**
 * The parameters that hold still for a Child's whole life: set once, never eased. Validation and
 * the Resolver split each kind's parameters by this one list.
 */
export type HeldParameter = 'points' | 'd';

/** The animated properties of a Shape of kind `K`: what its `easing` map is keyed by. */
type ShapeProperty<K extends ShapeKind> = Exclude<
  keyof (ShapeParams[K] & ShapeCommon),
  'duration' | 'delay' | HeldParameter
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
  /**
   * Time between one Child's start and the next, in order clockwise from 12 o'clock. Each Child is
   * thrown from the Origin when it starts. Reach for it to make a burst ripple out instead of pop.
   * With an `easing`, the starts keep the same span, `each` × (`count` − 1), but spread along the
   * curve, so a burst can land unevenly on purpose. A start the curve puts before 0 is held at 0.
   */
  stagger?: NumericValue<TimeUnit> | { each: NumericValue<TimeUnit>; easing?: Curve };
  /** Time to wait before the Burst starts: before any Child starts, and before it throws them. */
  delay?: Distributable<NumericValue<TimeUnit>>;
  /** Distance from the Origin to each Child. Animates over the Burst's duration. */
  radius?: NumericProperty<LengthUnit>;
  /** How the Burst's own `radius` moves. Its Children take their own `easing`. */
  easing?: Easing<'radius'>;
  /**
   * The Child spawned `count` times: an Element, another Emitter, or a Modifier around either. Hand
   * different Children out in turn with `each([...])`, such as circles and stars in one Burst.
   */
  children: Distributable<ChildSpec>;
}

/**
 * The JSON-serializable description of a Swirl: one Child whose path it bends. A Swirl turns the
 * ray the Burst around it throws its Child along, about the start of that ray, by
 * `direction` × `size` × sin(2π × `frequency` × progress), where progress runs 0–1 along the throw
 * as the Burst's `radius` eases, so for a radius moving between two values the waves sit at the
 * same places on the path whatever the Burst's `easing`. It draws nothing and adds no time: a Swirl lasts as long as its Child. With no
 * Burst around it there is no throw to bend, and its Child is drawn unchanged. Reach for it to make
 * a Burst's Children wriggle outward instead of flying straight.
 */
export interface SwirlSpec {
  kind: 'swirl';
  /** How far the throw turns at the crest of a wave. The sideways reach grows with distance. */
  size?: Distributable<NumericValue<AngleUnit>>;
  /** How many waves over the whole throw. */
  frequency?: Distributable<NumericValue>;
  /** Which way the first wave turns: 1 clockwise, -1 counterclockwise. `each([1, -1])` alternates. */
  direction?: Distributable<1 | -1>;
  /** The Child whose path this bends: an Element, an Emitter, or another Modifier. */
  child: ChildSpec;
}

/** Anything an Emitter or a Modifier can hold. Discriminated on `kind`. */
export type ChildSpec = ShapeSpec | BurstSpec | SwirlSpec;
