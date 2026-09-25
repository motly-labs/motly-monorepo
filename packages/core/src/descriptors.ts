import { derive, unit } from './rng.js';
import type { Keyframes, NumericProperty, NumericValue } from './spec.js';

/**
 * A number drawn uniformly from [`min`, `max`), resolved per Instance and per Child. What `rand()`
 * returns; name it only when typing Specs by hand.
 */
export interface RandDescriptor {
  readonly __motly: 'rand';
  readonly min: number;
  readonly max: number;
}

/**
 * A Distribution: successive values for successive Children, repeating in order. What `each()`
 * returns; name it only when typing Specs by hand.
 */
export interface EachDescriptor<T> {
  readonly __motly: 'each';
  readonly values: readonly [T, ...T[]];
}

/**
 * A Spec value that may differ per Child: the value itself, or an `each()` of values. Name it when
 * typing a helper that builds Specs.
 */
export type Distributable<T> = T | EachDescriptor<T>;

/**
 * A random number between `min` and `max`, kept in the Spec as a Descriptor so the Spec stays
 * JSON-serializable. Reach for it wherever a number should vary per Child or per play; bind a
 * `seed` to the Instance to make it reproducible.
 */
export function rand(min: number, max: number): RandDescriptor {
  return { __motly: 'rand', min, max };
}

/**
 * Hand `values` to an Emitter's Children in turn: the first to Child 0, the second to Child 1, and
 * round again when they run out. Reach for it instead of an array, which means Keyframes.
 */
export function each<const V extends readonly [unknown, ...unknown[]]>(
  values: V,
): EachDescriptor<V[number]> {
  return { __motly: 'each', values };
}

function isEach<T>(value: Distributable<T>): value is EachDescriptor<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<EachDescriptor<T>>).__motly === 'each'
  );
}

/** The value `value` hands to the Child at `index` within its Emitter. */
export function resolveValue<T>(value: Distributable<T>, index: number): T {
  if (!isEach(value)) return value;
  // `values` is non-empty by type, so the modulo always lands on an element.
  return value.values[index % value.values.length] as T;
}

/**
 * A numeric Spec value with its `rand()` drawn: a number, or a string whose unit the Resolver has
 * yet to convert.
 */
export type Drawn = number | string;

/** `value` with its `rand()`, if it is one, drawn from `seed`. */
function draw(value: NumericValue<string>, seed: number): Drawn {
  return typeof value === 'object' ? value.min + (value.max - value.min) * unit(seed) : value;
}

/** Whether `value` is Keyframes rather than a single value. */
function isKeyframes<V>(value: V | Keyframes<V>): value is Keyframes<V> {
  return Array.isArray(value);
}

/**
 * A numeric property for the Child at `index`, with `seed` the Seed of that Child's property:
 * `each()` picks the value first, then every `rand()` in it draws, one Keyframe slot each. A
 * constant `rand` and the first Keyframe share a slot, so `rand` → `[rand, 0]` keeps its value.
 * Units stay as written; converting them is the Resolver's job.
 */
export function resolveNumeric(
  property: NumericProperty<string>,
  seed: number,
  index: number,
): Drawn | readonly Drawn[] {
  const value = resolveValue(property, index);
  if (!isKeyframes(value)) return draw(value, derive(seed, 0));
  const frames = value.map((frame, slot) => draw(frame, derive(seed, slot)));
  return frames.length === 1 ? (frames[0] as Drawn) : frames;
}
