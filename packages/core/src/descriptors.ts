import type { ResolvedNumeric } from './resolve.js';
import { derive, unit } from './rng.js';
import type { Keyframes, NumericProperty, NumericValue } from './spec.js';
import { toNumber, type Units } from './units.js';

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

/** The error for a Spec value, such as mojs's `{ from: to }`, that is no kind of value `name` takes. */
export function notAValue(name: string, value: unknown): Error {
  return new Error(`motly: ${name} cannot be ${JSON.stringify(value)}. Keyframes are an array.`);
}

/** `value` as a number in `units`' base unit, drawing it from `seed` if it is a `rand()`. */
function resolveNumber(
  value: NumericValue<string>,
  seed: number,
  units: Units,
  name: string,
): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return toNumber(value, units, name);
  if (value.__motly === 'rand') return value.min + (value.max - value.min) * unit(seed);
  throw notAValue(name, value);
}

/** Whether `value` is Keyframes rather than a single value. */
export function isKeyframes<V>(value: V | Keyframes<V>): value is Keyframes<V> {
  return Array.isArray(value);
}

/**
 * Keyframes `frames` of property `name`, each resolved by `resolveFrame` with its slot. Throws for
 * an empty array, which a JSON Spec can hold though the type cannot.
 */
export function resolveKeyframes<V, R>(
  frames: Keyframes<V>,
  name: string,
  resolveFrame: (frame: V, slot: number) => R,
): readonly R[] {
  if (frames.length === 0) throw new Error(`motly: ${name} has no Keyframes.`);
  return frames.map(resolveFrame);
}

/**
 * Numeric property `name` resolved for the Child at `index`, with `seed` the Seed of that Child's
 * property and `units` the units it accepts: `each()` picks the value first, then every `rand()` in
 * it draws, one Keyframe slot each. A constant `rand` and the first Keyframe share a slot, so
 * `rand` → `[rand, 0]` keeps its value.
 */
export function resolveNumeric(
  property: NumericProperty<string>,
  seed: number,
  index: number,
  units: Units,
  name: string,
): ResolvedNumeric {
  const value = resolveValue(property, index);
  if (!isKeyframes(value)) return resolveNumber(value, derive(seed, 0), units, name);
  const frames = resolveKeyframes(value, name, (frame, slot) =>
    resolveNumber(frame, derive(seed, slot), units, name),
  );
  return frames.length === 1 ? (frames[0] as number) : frames;
}
